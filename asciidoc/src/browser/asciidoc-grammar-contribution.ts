/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 ********************************************************************************/

import { LanguageGrammarDefinitionContribution, TextmateRegistry } from "@theia/monaco/lib/browser/textmate";
import { injectable } from "inversify";
import { ASCIIDOC_LANGUAGE_ID } from "../common";

@injectable()
export class AsciidocGrammarContribution implements LanguageGrammarDefinitionContribution {

    readonly config: monaco.languages.LanguageConfiguration =
        {
            "comments": {
                "lineComment": "//",
                "blockComment": ["////", "////"]
            },
            "brackets": [
                ["{", "}"],
                ["[", "]"],
                ["(", ")"],
                ["<", ">"]
            ],
            "autoClosingPairs": [
                { "open": "{", "close": "}" },
                { "open": "[", "close": "]" },
                { "open": "(", "close": ")" },
                { "open": "'", "close": "'", "notIn": ["string", "comment"] },
                { "open": "\"", "close": "\"", "notIn": ["string"] },
                { "open": "`", "close": "`", "notIn": ["string", "comment"] },
                { "open": "/**", "close": " */", "notIn": ["string"] },
                { "open": "////", "close": " ////", "notIn": ["string", "comment"] }
            ],
            "surroundingPairs": [
                { "open": "{", "close": "}" },
                { "open": "[", "close": "]" },
                { "open": "(", "close": ")" },
                { "open": "'", "close": "'"},
                { "open": "\"", "close": "\""},
                { "open": "`", "close": "`"}
            ]
        };

    registerTextmateLanguage(registry: TextmateRegistry) {
        monaco.languages.register({
            id: ASCIIDOC_LANGUAGE_ID,
            "aliases": [
                "AsciiDoc",
                "AsciiDoc(tor)"
            ],
            "extensions": [
                ".adoc",
                ".ad",
                ".asciidoc"
            ],
            "filenames": []
        });

        monaco.languages.setLanguageConfiguration(ASCIIDOC_LANGUAGE_ID, this.config);

        const adocGrammar = require('../../data/asciidoctor.tmLanguage.json');
        registry.registerTextmateGrammarScope('text.asciidoc', {
            async getGrammarDefinition() {
                return {
                    format: 'json',
                    content: adocGrammar
                };
            }
        });

        registry.mapLanguageIdToTextmateGrammar(ASCIIDOC_LANGUAGE_ID, 'text.asciidoc');
    }
}