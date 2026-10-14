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

function formatAuthor(author) {
    if (author == null || typeof author === "string") {
        return author;
    }

    const parts = [author.name];
    if (author.email != null) {
        parts.push(`<${author.email}>`);
    }

    if (author.url != null) {
        parts.push(`(${author.url})`);
    }

    return parts.join(" ");
}

class UniChatManifestPlugin {
    constructor(options) {
        this.values = {
            widgetName: options.name,
            widgetDescription: options.description,
            widgetVersion: options.version,
            widgetAuthor: formatAuthor(options.author),
            widgetLicense: options.license,
            widgetHomepage: options.homepage,
            unichatVersion: options.unichatVersion
        };
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap("UniChatManifestPlugin", (compilation) => {
            compilation.hooks.processAssets.tap(
                { name: "UniChatManifestPlugin", stage: Compilation.PROCESS_ASSETS_STAGE_DERIVED },
                () => {
                    const manifest = compilation.getAsset("manifest.yaml");
                    if (manifest == null) {
                        return;
                    }

                    const values = this.values;
                    const template = manifest.source.source().toString();
                    const content = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                        if (!(key in values)) {
                            return match;
                        }

                        if (values[key] == null) {
                            compilation.warnings.push(new Error(`manifest.yaml: "${key}" is not defined`));
                            return "";
                        }

                        return values[key];
                    });

                    compilation.updateAsset("manifest.yaml", new sources.RawSource(content));
                }
            );
        });
    }
}

module.exports = { UniChatManifestPlugin: UniChatManifestPlugin };
