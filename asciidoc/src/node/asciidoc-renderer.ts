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
        const basePath = FileUri.fsPath(uri.parent);
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'asciidoc-'));
        const inputFile = path.join(dir, uri.path.base);
        await fs.writeFile(inputFile, adoc);
        const outputFile = path.join(dir, uri.path.base + '.html');
        const command = 'asciidoctor ' + inputFile + ' -o ' + outputFile + ' -B ' + basePath + ' -s';
        console.log('Executing : ' + command);
        exec(command, async (err, stdout, stderr) => {
            fs.remove(inputFile);
            let htmlResult = '';
            if (stderr || err) {
                htmlResult = `
                    <div style="color: red;">
                        <h1>Error from Asciidoctor</h2>
                        ${(stderr || err)!.toString().split('\n').map(line => `<p/>${line}</p>`)}
                    </div>
                `;
            }
            if (fs.existsSync(outputFile)) {
                htmlResult += (await fs.readFile(outputFile)).toString();
                fs.remove(outputFile);
            }
            result.resolve(htmlResult);
        });
        return result.promise;
    }

}