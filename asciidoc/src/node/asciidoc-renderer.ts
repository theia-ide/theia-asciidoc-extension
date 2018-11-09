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

@injectable()
export class AsciidocRendererImpl implements AsciidocRenderer {

    async render(adoc: string): Promise<string> {
        const result = new Deferred<string>();
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'asciidoc-'));
        const adocFile = path.join(dir, 'contents.adoc');
        await fs.writeFile(adocFile, adoc);
        exec('asciidoctor ' + adocFile + ' -s', async (err, stdout, stderr) => {
            if (stderr || err) {
                result.resolve(`
                    <div>
                        <h1>Error from Asciidoctor</h2>
                        <p>${stderr || err}</p>
                    </div>
                `);
            }
            const contents = (await fs.readFile(path.join(dir, '/contents.html'))).toString();
            result.resolve(contents);
        });
        return result.promise;
    }

}