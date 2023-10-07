import { Plugin } from "obsidian";
import { createEvent, createStore, sample } from "effector";
import { reset } from "patronum";
import { $canvas, $canvasFile } from "~/entites/canvas";

import "../features/split-node-by-lines";
import "../features/merge-nodes";
import "../features/copy-style";
import "../features/add-next-node";
import "../features/add-element-node";

export const pluginLoaded = createEvent<{ plugin: Plugin }>();
export const pluginUnloaded = createEvent();

export const $plugin = createStore<Plugin | null>(null);

sample({
	clock: pluginLoaded.map(({ plugin }) => plugin),
	target: $plugin,
});
reset({
	clock: pluginUnloaded,
	target: [$canvas, $plugin, $canvasFile],
});
