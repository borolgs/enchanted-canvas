import { createEffect, sample } from "effector";
import { onNodeMenu } from "~/entites/canvas";
import { SplitBy, splitNodeByLines } from "./lib";
import { Menu } from "obsidian";
import { CanvasNode } from "~/shared/types";
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
export const splitNodeByLinesFx = createEffect(splitNodeByLines);

sample({
	clock: onNodeMenu,
	filter: ({ node }) => isTextNode(node) && !isCustomNode(node),
	target: addSplitMenuFx,
});

splitNodeByLinesFx.fail.watch(({ error }) => {
	console.error(error);
});
