/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 ********************************************************************************/

import { injectable } from "inversify";
import { AsciidocRenderer } from "../common";
import * as AsciiDoc from "asciidoctor.js";

@injectable()
export class AsciidocRendererImpl implements AsciidocRenderer {

    private doc = new AsciiDoc();

    async render(adoc: string): Promise<string> {
        return this.doc.convert(adoc);
    }

}