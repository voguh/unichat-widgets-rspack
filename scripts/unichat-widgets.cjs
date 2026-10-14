#!/usr/bin/env node
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

const packageRoot = path.resolve(__dirname, "..");
const templatesRoot = path.join(packageRoot, "templates");
const projectRoot = process.cwd();

const USAGE = "Usage: unichat-widgets --init";

function copyMissingFiles(sourceDirectory, targetDirectory) {
    const entries = fs.readdirSync(sourceDirectory, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(sourceDirectory, entry.name);
        const targetPath = path.join(targetDirectory, entry.name);

        if (entry.isDirectory()) {
            fs.mkdirSync(targetPath, { recursive: true });
            copyMissingFiles(sourcePath, targetPath);
            continue;
        }

        if (fs.existsSync(targetPath)) {
            console.log(`skipped ${path.relative(projectRoot, targetPath)} (already exists)`);
            continue;
        }

        fs.copyFileSync(sourcePath, targetPath);
        console.log(`created ${path.relative(projectRoot, targetPath)}`);
    }
}

function init() {
    if (!fs.existsSync(path.join(projectRoot, "package.json"))) {
        console.error("package.json not found in the current directory");
        process.exit(1);
    }

    copyMissingFiles(templatesRoot, projectRoot);
}

function main() {
    const args = process.argv.slice(2);

    if (args.includes("--init")) {
        init();
        return;
    }

    console.error(USAGE);
    process.exit(1);
}

main();
