import { PreviewHandler, RenderContentParams } from "@theia/preview/lib/browser/preview-handler";
import URI from "@theia/core/lib/common/uri";
import { MaybePromise } from "@theia/core";
import { injectable } from "inversify";
import * as AsciiDoc from "asciidoctor.js";

@injectable()
export class AsciiDocPreviewHandler implements PreviewHandler {

    readonly iconClass: string = 'asciidoc-icon file-icon';

    canHandle(uri: URI): number {
        for (const ext of [".adoc", ".ad", ".asciidoc"]) {
            if (uri.path.toString().endsWith(ext)) {
                return 500;
            }
        }
        return 0;
    }

    renderContent(params: RenderContentParams): MaybePromise<HTMLElement | undefined> {
        var html = new AsciiDoc().convert(params.content);
        var div = document.createElement('div');
        div.style.color = 'var(--theia-content-font-color0)';
        div.style.margin = '15px';
        div.innerHTML = html.trim();
        return div;
    }

}