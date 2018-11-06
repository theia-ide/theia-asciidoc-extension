import { ContainerModule } from "inversify";
import { AsciidocGrammarContribution } from './asciidoc-grammar-contribution';
import { LanguageGrammarDefinitionContribution } from '@theia/monaco/lib/browser/textmate';
import { AsciiDocPreviewHandler } from './asciidoc-preview-handler';
import { PreviewHandler } from "@theia/preview/lib/browser/preview-handler";

export default new ContainerModule(bind => {
    bind(LanguageGrammarDefinitionContribution).to(AsciidocGrammarContribution).inSingletonScope();
    bind(AsciiDocPreviewHandler).toSelf().inSingletonScope();
    bind(PreviewHandler).toService(AsciiDocPreviewHandler);
});