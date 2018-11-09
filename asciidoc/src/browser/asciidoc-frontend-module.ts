/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 ********************************************************************************/

import { ContainerModule } from "inversify";
import { AsciidocGrammarContribution } from './asciidoc-grammar-contribution';
import { LanguageGrammarDefinitionContribution } from '@theia/monaco/lib/browser/textmate';
import { AsciiDocPreviewHandler } from './asciidoc-preview-handler';
import { PreviewHandler } from "@theia/preview/lib/browser/preview-handler";
import { AsciidocRenderer, asciidoc_service_path } from "../common";
import { WebSocketConnectionProvider } from "@theia/core/lib/browser";

export default new ContainerModule(bind => {
    bind(LanguageGrammarDefinitionContribution).to(AsciidocGrammarContribution).inSingletonScope();
    bind(AsciiDocPreviewHandler).toSelf().inSingletonScope();
    bind(PreviewHandler).toService(AsciiDocPreviewHandler);

    bind(AsciidocRenderer).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<AsciidocRenderer>(asciidoc_service_path);
    }).inSingletonScope();
});