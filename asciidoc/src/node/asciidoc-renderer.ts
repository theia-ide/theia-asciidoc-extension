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
import * as fs from "fs-extra";
import * as path from 'path';
import * as os from 'os';
import { exec } from "child_process";
import { Deferred } from "@theia/core/lib/common/promise-util";
import URI from "@theia/core/lib/common/uri";
import { FileUri } from "@theia/core/lib/node/file-uri";

@injectable()
export class AsciidocRendererImpl implements AsciidocRenderer {

    async render(originalURI: string, adoc: string): Promise<string> {
        const result = new Deferred<string>();
        const uri = new URI(originalURI);
        const adocFile = FileUri.fsPath(uri.withPath(uri.path.toString().replace(uri.path.base, '.tmp-'+uri.path.base)));
        await fs.writeFile(adocFile, adoc);
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'asciidoc-'));
        const htmlFile = path.join(dir, 'output.html');
        exec('asciidoctor ' + adocFile + ' ' + htmlFile + ' -s', async (err, stdout, stderr) => {
            fs.remove(adocFile);
            if (stderr || err) {
                result.resolve(`
                    <div>
                        <h1>Error from Asciidoctor</h2>
                        <p>${stderr || err}</p>
                    </div>
                `);
            }
            const contents = (await fs.readFile(htmlFile)).toString();
            result.resolve(contents);
        });
        return result.promise;
    }

}