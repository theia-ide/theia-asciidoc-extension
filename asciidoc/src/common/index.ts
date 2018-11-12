/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 ********************************************************************************/

export const ASCIIDOC_LANGUAGE_ID = 'asciidoc'
export const ASCIIDOC_LANGUAGE_NAME = 'AsciiDoc (Asciidoctor)'

export const asciidoc_service_path = '/services/asciidoc';
export const AsciidocRenderer = Symbol('AsciidocRenderer');
export interface AsciidocRenderer {
    render(originalURI: string, adoc: string): Promise<string>
}