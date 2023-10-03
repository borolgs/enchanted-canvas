import { defineConfig } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import { babel } from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import builtins from "builtin-modules";
import copy from "rollup-plugin-copy";
import dotenv from "dotenv";
import manifest from "./manifest.json";
import fs from "fs";
import path from "path";

dotenv.config();

const prod = process.env.ROLLUP_WATCH !== "true";
let distDir = "dist";

const obsidianPluginsDir = process.env.OBSIDIAN_PLUGINS_DIR;
if (!prod && obsidianPluginsDir) {
	if (fs.existsSync(obsidianPluginsDir)) {
		const pluginDir = path.join(obsidianPluginsDir, manifest.id);
		if (!fs.existsSync(path.join(obsidianPluginsDir, manifest.id))) {
			fs.mkdirSync(pluginDir);
		}
		distDir = pluginDir;

		// https://github.com/pjeby/hot-reload
		fs.closeSync(fs.openSync(path.join(distDir, ".hotreload", ""), "w"));
	}
}
const extensions = [".ts", ".tsx", ".js"];

const plugins = [
	babel({
		babelHelpers: "bundled",
		sourceMaps: true,
		extensions: extensions,
		exclude: /node_modules.*/,
	}),
	commonjs(),
	alias({
		entries: [{ find: "~", replacement: path.resolve(__dirname, "src") }],
	}),
	resolve({ extensions }),
	json(),
	copy({
		targets: [
			{
				src: "manifest.json",
				dest: distDir,
			},
			{
				src: "src/styles.css",
				dest: distDir,
			},
		],
	}),
];
if (prod) {
	plugins.push(terser);
}

export default defineConfig([
	{
		input: `src/main.ts`,
		output: [
			{
				file: path.join(distDir, "main.js"),
				format: "cjs",
			},
		],
		external: [
			"obsidian",
			"electron",
			"@codemirror/autocomplete",
			"@codemirror/collab",
			"@codemirror/commands",
			"@codemirror/language",
			"@codemirror/lint",
			"@codemirror/search",
			"@codemirror/state",
			"@codemirror/view",
			"@lezer/common",
			"@lezer/highlight",
			"@lezer/lr",
			...builtins,
		],
		plugins,
	},
]);
