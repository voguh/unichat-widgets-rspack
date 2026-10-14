/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

const fs = require("node:fs");
const path = require("node:path");

class UniChatWidgetDirectoryPlugin {
    constructor(options) {
        this.directory = options.directory;
        this.allowedEntries = options.allowedEntries;
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap("UniChatWidgetDirectoryPlugin", (compilation) => {
            compilation.hooks.finishModules.tap("UniChatWidgetDirectoryPlugin", () => {
                compilation.contextDependencies.add(this.directory);

                if (!fs.existsSync(this.directory)) {
                    return;
                }

                const directoryName = path.basename(this.directory);
                const entries = fs.readdirSync(this.directory);

                for (const entry of entries) {
                    if (this.allowedEntries.includes(entry)) {
                        continue;
                    }

                    const message = `${directoryName}/${entry} is ignored, only ${this.allowedEntries.join(", ")} are used`;
                    compilation.warnings.push(new Error(message));
                }
            });
        });
    }
}

module.exports = { UniChatWidgetDirectoryPlugin: UniChatWidgetDirectoryPlugin };
