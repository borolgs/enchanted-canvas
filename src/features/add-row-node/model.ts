import { createEffect, sample } from "effector";
import { $canvas } from "src/entites/canvas";
import { hotkey } from "src/shared/keyboard";
import { Canvas, CanvasNode } from "src/shared/types";

const createNodeUnderCurrentFx = createEffect(
	({ node, canvas }: { node: CanvasNode; canvas: Canvas }) => {
		const next: CanvasNode = canvas.createTextNode({
			pos: { x: node.x, y: node.y + node.height + 10 },
			text: "",
			size: { width: node.width, height: 50 },
		});

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

		return true;
	},
	fn: (canvas) => ({
		canvas: canvas!,
		node: Array.from(canvas!.selection)[0],
	}),
	target: createNodeUnderCurrentFx,
});
