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
import { AsciidocRenderer, asciidoc_service_path } from "../common";
import { AsciidocRendererImpl } from "./asciidoc-renderer";
import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core";

export default new ContainerModule(bind => {
    bind<AsciidocRenderer>(AsciidocRenderer).to(AsciidocRendererImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<AsciidocRenderer>(asciidoc_service_path, () => {
            return ctx.container.get(AsciidocRenderer);
        })
    ).inSingletonScope();
});