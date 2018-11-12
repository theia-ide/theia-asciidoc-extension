/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 ********************************************************************************/

import { PreviewHandler, RenderContentParams } from "@theia/preview/lib/browser/preview-handler";
import { PreviewLinkNormalizer } from "@theia/preview/lib/browser/preview-link-normalizer";
import { PreviewUri } from "@theia/preview/lib/browser/preview-uri";
import { PreviewOpenerOptions } from "@theia/preview/lib/browser/preview-contribution";

import URI from "@theia/core/lib/common/uri";
import { injectable, inject } from "inversify";
import { AsciidocRenderer } from "../common";
import * as hljs from 'highlight.js';
import '../../src/browser/theming.css';
import { OpenerService } from "@theia/core/lib/browser";
import { isOSX } from "@theia/core";

@injectable()
export class AsciiDocPreviewHandler implements PreviewHandler {

    readonly iconClass: string = 'asciidoc-icon file-icon';

    constructor(
        @inject(AsciidocRenderer) protected renderer: AsciidocRenderer,
        @inject(PreviewLinkNormalizer) protected readonly linkNormalizer: PreviewLinkNormalizer,
        @inject(OpenerService) protected readonly openerService: OpenerService
    ) { }

    canHandle(uri: URI): number {
        for (const ext of [".adoc", ".ad", ".asciidoc"]) {
            if (uri.path.toString().endsWith(ext)) {
                return 500;
            }
        }
        return 0;
    }

    async renderContent(params: RenderContentParams): Promise<HTMLElement | undefined> {
        var html = await this.renderer.render(params.originUri.toString(), params.content);
        var div = document.createElement('div');
        div.classList.add('markdown-preview');
        div.innerHTML = html.trim();
        this.applyPrettyPrinting(div);
        this.translateLinks(params.originUri, div);
        this.addLinkClickedListener(div, params);
        return div;
    }

    protected applyPrettyPrinting(previewElement: HTMLElement) {
        var blocks = previewElement!.querySelectorAll('pre code');
        for (const block of Array.from(blocks)) {
            hljs.highlightBlock(block);
        }
    }

    protected translateLinks(documentUri: URI, previewElement: HTMLElement) {
        var images = previewElement!.querySelectorAll('img');
        for (const image of Array.from(images)) {
            image.src = this.linkNormalizer.normalizeLink(documentUri, image.getAttribute('src')!);
        }
    }

    protected addLinkClickedListener(contentElement: HTMLElement, params: RenderContentParams): void {
        contentElement.addEventListener('click', (event: MouseEvent) => {
            const candidate = (event.target || event.srcElement) as HTMLElement;
            const link = this.findLink(candidate, contentElement);
            if (link) {
                event.preventDefault();
                if (link.startsWith('#')) {
                    this.revealFragment(contentElement, link);
                } else {
                    const preview = !(isOSX ? event.metaKey : event.ctrlKey);
                    const uri = this.resolveUri(link, params.originUri, preview);
                    this.openLink(uri, params.originUri);
                }
            }
        });
    }

    protected findLink(element: HTMLElement, container: HTMLElement): string | undefined {
        let candidate = element;
        while (candidate.tagName !== 'A') {
            if (candidate === container) {
                return;
            }
            candidate = candidate.parentElement!;
            if (!candidate) {
                return;
            }
        }
        return candidate.getAttribute('href') || undefined;
    }

    protected async openLink(uri: URI, originUri: URI): Promise<void> {
        const opener = await this.openerService.getOpener(uri);
        opener.open(uri, <PreviewOpenerOptions>{ originUri });
    }

    protected resolveUri(link: string, uri: URI, preview: boolean): URI {
        const linkURI = new URI(link);
        if (!linkURI.path.isAbsolute && (
            !(linkURI.scheme || linkURI.authority) ||
            (linkURI.scheme === uri.scheme && linkURI.authority === uri.authority)
        )) {
            const resolvedUri = uri.parent.resolve(linkURI.path).withFragment(linkURI.fragment).withQuery(linkURI.query);
            return preview ? PreviewUri.encode(resolvedUri) : resolvedUri;
        }
        return linkURI;
    }

    protected revealFragment(contentElement: HTMLElement, fragment: string) {
        const elementToReveal = this.findElementForFragment(contentElement, fragment);
        if (!elementToReveal) {
            return;
        }
        elementToReveal.scrollIntoView({ behavior: 'instant' });
    }

    findElementForFragment(content: HTMLElement, link: string): HTMLElement | undefined {
        const fragment = link.startsWith('#') ? link.substring(1) : link;
        const filter: NodeFilter = {
            acceptNode: (node: Node) => {
                if (node instanceof HTMLHeadingElement) {
                    if (node.tagName.toLowerCase().startsWith('h') && node.id === fragment) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_SKIP;
            }
        };
        const treeWalker = document.createTreeWalker(content, NodeFilter.SHOW_ELEMENT, filter, false);
        if (treeWalker.nextNode()) {
            const element = treeWalker.currentNode as HTMLElement;
            return element;
        }
        return undefined;
    }

    findElementForSourceLine(content: HTMLElement, sourceLine: number): HTMLElement | undefined {
        const markedElements = content.getElementsByClassName('line');
        let matchedElement: HTMLElement | undefined;
        for (let i = 0; i < markedElements.length; i++) {
            const element = markedElements[i];
            const line = Number.parseInt(element.getAttribute('data-line') || '0');
            if (line > sourceLine) {
                break;
            }
            matchedElement = element as HTMLElement;
        }
        return matchedElement;
    }

    getSourceLineForOffset(content: HTMLElement, offset: number): number | undefined {
        const lineElements = this.getLineElementsAtOffset(content, offset);
        if (lineElements.length < 1) {
            return undefined;
        }
        const firstLineNumber = this.getLineNumberFromAttribute(lineElements[0]);
        if (firstLineNumber === undefined) {
            return undefined;
        }
        if (lineElements.length === 1) {
            return firstLineNumber;
        }
        const secondLineNumber = this.getLineNumberFromAttribute(lineElements[1]);
        if (secondLineNumber === undefined) {
            return firstLineNumber;
        }
        const y1 = lineElements[0].offsetTop;
        const y2 = lineElements[1].offsetTop;
        const dY = (offset - y1) / (y2 - y1);
        const dL = (secondLineNumber - firstLineNumber) * dY;
        const line = firstLineNumber + Math.floor(dL);
        return line;
    }

    /**
     * returns two significant line elements for the given offset.
     */
    protected getLineElementsAtOffset(content: HTMLElement, offset: number): HTMLElement[] {
        let skipNext = false;
        const filter: NodeFilter = {
            acceptNode: (node: Node) => {
                if (node instanceof HTMLElement) {
                    if (node.classList.contains('line')) {
                        if (skipNext) {
                            return NodeFilter.FILTER_SKIP;
                        }
                        if (node.offsetTop > offset) {
                            skipNext = true;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_REJECT;
            }
        };
        const treeWalker = document.createTreeWalker(content, NodeFilter.SHOW_ELEMENT, filter, false);
        const lineElements: HTMLElement[] = [];
        while (treeWalker.nextNode()) {
            const element = treeWalker.currentNode as HTMLElement;
            lineElements.push(element);
        }
        return lineElements.slice(-2);
    }

    protected getLineNumberFromAttribute(element: HTMLElement): number | undefined {
        const attribute = element.getAttribute('data-line');
        return attribute ? Number.parseInt(attribute) : undefined;
    }
}