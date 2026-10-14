/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

const { Compilation, sources } = require("@rspack/core");

class UniChatFieldsPlugin {
    constructor(options) {
        this.schemaUrl = options.schemaUrl;
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap("UniChatFieldsPlugin", (compilation) => {
            compilation.hooks.processAssets.tap(
                { name: "UniChatFieldsPlugin", stage: Compilation.PROCESS_ASSETS_STAGE_DERIVED },
                () => {
                    const fieldsAsset = compilation.getAsset("fields.json");
                    if (fieldsAsset == null) {
                        return;
                    }

                    const content = fieldsAsset.source.source().toString();
                    const fields = JSON.parse(content);
                    fields.$schema = this.schemaUrl;

                    const updatedContent = `${JSON.stringify(fields, null, 4)}\n`;
                    compilation.updateAsset("fields.json", new sources.RawSource(updatedContent));
                }
            );
        });
    }
}

module.exports = { UniChatFieldsPlugin: UniChatFieldsPlugin };
