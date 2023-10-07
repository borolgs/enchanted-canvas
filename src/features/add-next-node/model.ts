import { createEffect, sample } from "effector";
import { $canvas } from "~/entites/canvas";
import {
	addCustomNodeStyles,
	getCustomNodeShape,
	isCustomNode,
	isTextNode,
	turnIntoCustomNode,
} from "~/entites/node";
import { hotkey } from "~/shared/keyboard";
import { Canvas, CanvasNode } from "~/shared/types";

const createNextNodeFx = createEffect(
	({ node, canvas }: { node: CanvasNode; canvas: Canvas }) => {
		let next: CanvasNode;

		if (isCustomNode(node) && getCustomNodeShape(node) === "rect") {
			next = canvas.createTextNode({
				pos: { x: node.x + node.width + 30, y: node.y },
				text: "",
				size: { width: node.width, height: node.height },
			});

			turnIntoCustomNode(next, "rect");
			canvas.requestSave();
			addCustomNodeStyles(next);
		} else {
			next = canvas.createTextNode({
				pos: { x: node.x, y: node.y + node.height + 10 },
				text: "",
				size: { width: node.width, height: 50 },
			});
		}

		next.setColor(node.color);
	}
);

sample({
	clock: hotkey({
		modifiers: "alt",
		key: "Enter",
	}),
	source: $canvas,
	filter: (canvas) => {
		if (!canvas) return false;
		if (canvas.selection.size !== 1) return false;

		const node = Array.from(canvas.selection)[0];
		if (!node.isEditing) {
			return false;
		}

		if (!isTextNode(node)) {
			return false;
		}

		if (getCustomNodeShape(node) === "circle") {
			return false;
		}

		return true;
	},
	fn: (canvas) => ({
		canvas: canvas!,
		node: Array.from(canvas!.selection)[0],
	}),
	target: createNextNodeFx,
});

createNextNodeFx.fail.watch(({ error }) => {
	console.error(error);
});
