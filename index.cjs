/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

const { UniChatFieldsPlugin } = require("./plugins/UniChatFieldsPlugin.cjs");
const { UniChatManifestPlugin } = require("./plugins/UniChatManifestPlugin.cjs");
const { UniChatWidgetDirectoryPlugin } = require("./plugins/UniChatWidgetDirectoryPlugin.cjs");
const { createBaseConfig } = require("./rspack.config.base.cjs");

/* ================================================================================================================== */

const CONCATENATED_PATHS = ["plugins", "module.rules"];

function isPlainObject(value) {
    if (value == null || typeof value !== "object") {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function mergeConfig(baseValue, userValue, currentPath) {
    if (userValue === undefined) {
        return baseValue;
    }

    if (CONCATENATED_PATHS.includes(currentPath) && Array.isArray(baseValue) && Array.isArray(userValue)) {
        return [...baseValue, ...userValue];
    }

    if (!isPlainObject(baseValue) || !isPlainObject(userValue)) {
        return userValue;
    }

    const merged = { ...baseValue };
    for (const [key, value] of Object.entries(userValue)) {
        let childPath = key;
        if (currentPath !== "") {
            childPath = `${currentPath}.${key}`;
        }

        merged[key] = mergeConfig(baseValue[key], value, childPath);
    }

    return merged;
}

/**
 * @param {import("@rspack/core").Configuration} userConfig
 * @returns {import("@rspack/core").Configuration}
 */
function withUniChatWidgets(userConfig = {}) {
    const projectRoot = userConfig.context ?? process.cwd();
    const baseConfig = createBaseConfig(projectRoot);

    const mergedConfig = mergeConfig(baseConfig, userConfig, "");
    mergedConfig.plugins = mergedConfig.plugins.filter(Boolean);

    return mergedConfig;
}

module.exports = {
    withUniChatWidgets: withUniChatWidgets,
    UniChatFieldsPlugin: UniChatFieldsPlugin,
    UniChatManifestPlugin: UniChatManifestPlugin,
    UniChatWidgetDirectoryPlugin: UniChatWidgetDirectoryPlugin
};
