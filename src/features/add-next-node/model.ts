import { createEffect, sample } from "effector";
import { $canvas } from "~/entites/canvas";
import {
	addCustomNodeStyles,
	createEdge,
	getCustomNodeShape,
	isCustomNode,
	isTextNode,
	turnIntoCustomNode,
} from "~/entites/node";
import { hotkey } from "~/shared/keyboard";
import { CanvasNode } from "~/shared/types";

const createNextNodeFx = createEffect(({ node }: { node: CanvasNode }) => {
	const { canvas } = node;
	let next: CanvasNode;
	const edges = canvas.getEdgesForNode(node);
	const parentNode = edges.find((_) => _.to.node.id === node.id)?.from.node;
	const siblings = parentNode
		? canvas
				.getEdgesForNode(parentNode)
				.filter((_) => _.from.node.id === parentNode.id)
				.map((_) => _.to.node)
		: [];
	const lastNode = siblings.length
		? siblings[siblings.length - 1]
		: undefined;
	const currentNode = lastNode ?? node;

	if (
		isCustomNode(currentNode) &&
		getCustomNodeShape(currentNode) === "rect"
	) {
		next = canvas.createTextNode({
			pos: {
				x: currentNode.x + currentNode.width + 30,
				y: currentNode.y,
			},
			text: "",
			size: { width: currentNode.width, height: currentNode.height },
		});

		turnIntoCustomNode(next, "rect");
		addCustomNodeStyles(next);
	} else {
		next = canvas.createTextNode({
			pos: {
				x: currentNode.x,
				y: currentNode.y + currentNode.height + 20,
			},
			text: "",
			size: { width: 250, height: 60 },
		});
	}

	next.setColor(node.color);

	if (parentNode) {
		createEdge(canvas, {
			from: parentNode,
			to: next,
		});
	}

	canvas.requestSave();
});

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

// siblings

const createSiblingNodeFx = createEffect(({ node }: { node: CanvasNode }) => {
	const { canvas } = node;
	const next = canvas.createTextNode({
		pos: {
			x: node.x + node.width + 200,
			y: node.y,
		},
		text: "",
		size: { width: 250, height: 60 },
	});

	createEdge(canvas, {
		from: node,
		to: next,
	});

	canvas.requestSave();
});

sample({
	clock: hotkey({
		modifiers: "alt",
		key: "Tab",
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

		return true;
	},
	fn: (canvas) => ({
		canvas: canvas!,
		node: Array.from(canvas!.selection)[0],
	}),
	target: createSiblingNodeFx,
});

createSiblingNodeFx.fail.watch(({ error }) => {
	console.error(error);
});
