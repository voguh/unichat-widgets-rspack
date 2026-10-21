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
const os = require("node:os");
const path = require("node:path");

const { CopyRspackPlugin } = require("@rspack/core");

const { UniChatFieldsPlugin } = require("./plugins/UniChatFieldsPlugin.cjs");
const { UniChatManifestPlugin } = require("./plugins/UniChatManifestPlugin.cjs");
const { UniChatWidgetDirectoryPlugin } = require("./plugins/UniChatWidgetDirectoryPlugin.cjs");

/* ================================================================================================================== */

const UNICHAT_API_PACKAGE = "@voguh/unichat-api";

function readJSON(filePath) {
    const content = fs.readFileSync(filePath, { encoding: "utf-8" });
    return JSON.parse(content);
}

function resolveWidgetName(pkgName) {
    const lastPkgNamePart = pkgName.split("/").pop();
    return lastPkgNamePart.replace(/^unichat-widget-/, "");
}

function resolveUnichatVersion(projectRoot, pkgJSON) {
    const dependencies = pkgJSON.dependencies ?? {};
    const devDependencies = pkgJSON.devDependencies ?? {};
    const dependencySpec = dependencies[UNICHAT_API_PACKAGE] ?? devDependencies[UNICHAT_API_PACKAGE];

    if (dependencySpec != null) {
        const tarballName = dependencySpec.split("/").pop();
        const tarballMatch = tarballName.match(/^unichat-api-(.*)\.tgz$/);
        if (tarballMatch != null) {
            return tarballMatch[1];
        }
    }

    const installedPkgJSONPath = path.join(projectRoot, "node_modules", UNICHAT_API_PACKAGE, "package.json");
    const installedPkgJSON = readJSON(installedPkgJSONPath);

    return installedPkgJSON.version;
}

function resolveUserWidgetsDirectory() {
    if (process.env.UNICHAT_WIDGETS_DIR != null) {
        return process.env.UNICHAT_WIDGETS_DIR;
    }

    if (process.platform === "win32") {
        return path.join(process.env.APPDATA, "unichat", "widgets");
    }

    if (process.platform === "darwin") {
        return path.join(os.homedir(), "Library", "Application Support", "unichat", "widgets");
    }

    const dataHome = process.env.XDG_DATA_HOME ?? path.join(os.homedir(), ".local", "share");
    return path.join(dataHome, "unichat", "widgets");
}

function resolveOutputPath(projectRoot, widgetName, isDev) {
    if (!isDev) {
        return path.join(projectRoot, "dist");
    }

    const userWidgetsDirectory = resolveUserWidgetsDirectory();
    return path.join(userWidgetsDirectory, widgetName);
}

/* ================================================================================================================== */

function createBaseConfig(projectRoot) {
    const isDev = process.env.NODE_ENV !== "production";

    const pkgJSON = readJSON(path.join(projectRoot, "package.json"));
    const widgetName = resolveWidgetName(pkgJSON.name);
    const unichatVersion = resolveUnichatVersion(projectRoot, pkgJSON);
    const fieldsSchemaUrl = `https://cdn.jsdelivr.net/gh/voguh/unichat@${unichatVersion}/unichat-api/widgets/fields-schema.json`;

    const widgetDirectory = path.join(projectRoot, "widget");

    /** @type {import("@rspack/core").Configuration} */
    const baseConfig = {
        mode: isDev ? "development" : "production",
        devtool: isDev ? "inline-source-map" : false,
        context: projectRoot,

        entry: {
            widget: path.join(projectRoot, "src/main.ts")
        },
        output: {
            path: resolveOutputPath(projectRoot, widgetName, isDev),
            publicPath: "",
            filename: "widget.js",
            cssFilename: "widget.css",
            assetModuleFilename: "assets/[name]-[contenthash][ext]",
            clean: { keep: /^fieldstate\.json$/ }
        },

        optimization: {
            minimize: !isDev,
            splitChunks: false,
            runtimeChunk: false
        },

        module: {
            parser: {
                css: { url: false },
                "css/auto": { url: false },
                "css/module": { url: false }
            }
        },

        plugins: [
            new UniChatManifestPlugin({
                name: widgetName,
                description: pkgJSON.description,
                version: pkgJSON.version,
                author: pkgJSON.author,
                license: pkgJSON.license,
                homepage: pkgJSON.homepage,
                unichatVersion: unichatVersion
            }),
            new UniChatFieldsPlugin({ schemaUrl: fieldsSchemaUrl }),
            new UniChatWidgetDirectoryPlugin({
                directory: widgetDirectory,
                allowedEntries: ["assets", "fields.json", "manifest.yaml", "widget.html"]
            }),
            new CopyRspackPlugin({
                patterns: [
                    {
                        from: path.join(widgetDirectory, "assets"),
                        to: "assets",
                        globOptions: { ignore: ["**/.gitkeep"] },
                        noErrorOnMissing: true
                    },
                    { from: path.join(widgetDirectory, "fields.json"), noErrorOnMissing: true },
                    { from: path.join(widgetDirectory, "manifest.yaml"), noErrorOnMissing: true },
                    { from: path.join(widgetDirectory, "widget.html"), noErrorOnMissing: true },
                    { from: path.join(widgetDirectory, "widget.css"), noErrorOnMissing: true }
                ]
            })
        ]
    };

    return baseConfig;
}

module.exports = { createBaseConfig: createBaseConfig };
