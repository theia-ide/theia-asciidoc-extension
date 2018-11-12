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
import URI from "@theia/core/lib/common/uri";
import { injectable, inject } from "inversify";
import { AsciidocRenderer } from "../common";
import { PreviewLinkNormalizer } from "@theia/preview/lib/browser/preview-link-normalizer";
import * as hljs from 'highlight.js';
import '../../src/browser/theming.css';

@injectable()
export class AsciiDocPreviewHandler implements PreviewHandler {

    readonly iconClass: string = 'asciidoc-icon file-icon';

    constructor(
        @inject(AsciidocRenderer) protected renderer: AsciidocRenderer,
        @inject(PreviewLinkNormalizer) protected readonly linkNormalizer: PreviewLinkNormalizer
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

}