import { attach, createEffect, sample } from "effector";
import { $canvas, $node, initCanvasMenu, onNodeMenu } from "~/entites/canvas";
import { SplitBy, splitNodeByLines } from "./lib";
import { Menu } from "obsidian";
import { Canvas, CanvasNode } from "~/shared/types";
import { isCustomNode, isTextNode } from "~/entites/node";

export const addSplitMenuFx = createEffect(
	function addSplitNodeByLinesMenuItem({
		node,
		menu,
	}: {
		node: CanvasNode;
		menu: Menu;
	}) {
		menu.addSeparator();
		menu.addItem((item) => {
			item.setTitle("Split by").setSection("extra");
			const subMenu: Menu = (item as any).setSubmenu();
			for (const splitBy of SplitBy) {
				subMenu.addItem((item) => {
					item.setTitle(splitBy).onClick(() => {
						splitNodeByLinesFx({ node, options: { by: splitBy } });
					});
				});
			}
		});
	}
);

export const addSplitMenuToCanvasFx = attach({
	source: $node,
	effect: (node) => {
		if (!node) {
			return;
		}
		const menuEl = document.querySelector("div.canvas-menu")!;

		const button = document.createElement("button");
		button.classList.add("clickable-icon");

		button.onclick = (e) => {
			const menu = new Menu();

			menu.setUseNativeMenu(false);

			for (const splitBy of SplitBy) {
				menu.addItem((item) => {
					item.setTitle(splitBy).onClick(() => {
						splitNodeByLinesFx({ node, options: { by: splitBy } });
					});
				});
			}

			menu.showAtMouseEvent(e);
		};

		// TODO!
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-split-square-vertical"><path d="M5 8V5c0-1 1-2 2-2h10c1 0 2 1 2 2v3"/><path d="M19 16v3c0 1-1 2-2 2H7c-1 0-2-1-2-2v-3"/><line x1="4" x2="20" y1="12" y2="12"/></svg>`;
		button.innerHTML = svg;

		menuEl.append(button);
	},
});

export const splitNodeByLinesFx = createEffect(splitNodeByLines);

sample({
	clock: onNodeMenu,
	filter: ({ node }) => isTextNode(node) && !isCustomNode(node),
	target: addSplitMenuFx,
});

sample({
	clock: initCanvasMenu,
	source: $canvas,
	filter: (canvas: Canvas | null) => {
		return canvas?.selection.size === 1;
	},
	target: addSplitMenuToCanvasFx,
});

splitNodeByLinesFx.fail.watch(({ error }) => {
	console.error(error);
});
