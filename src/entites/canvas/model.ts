import { Menu, Point, TFile } from "obsidian";
import { Canvas, CanvasEdge, CanvasNode, Size } from "../../shared/types";
import { createEvent, createStore, sample } from "effector";
import { once } from "patronum";

export const canvasLoaded = createEvent<{ canvas: Canvas; file: TFile }>();

export const onCreationMenu = createEvent<{
	menu: Menu;
	pos: Point;
	size?: Size;
	canvas: Canvas;
}>();
export const onSelectionMenu = createEvent<{ menu: Menu; canvas: Canvas }>();
export const onNodeMenu = createEvent<{ menu: Menu; node: CanvasNode }>();
export const onNodeInitialized = createEvent<{ node: CanvasNode }>();
export const onEdgeMenu = createEvent<{ menu: Menu; edge: CanvasEdge }>();
export const onConnectionMenu = createEvent<{
	menu: Menu;
	from: CanvasNode;
	edge: CanvasEdge;
}>();

export const onMenuRender = createEvent();
export const onNodeInteractionLayerRender = createEvent();
export const onNodeInteractionLayerSetTarget = createEvent<{
	target: CanvasNode;
}>();

export const $canvas = createStore<Canvas | null>(null);
export const $canvasFile = createStore<TFile | null>(null);

/** Last target node */
export const $node = createStore<CanvasNode | null>(null);

sample({
	clock: canvasLoaded,
	fn: ({ canvas }) => canvas,
	target: $canvas,
});
sample({
	clock: canvasLoaded,
	source: $canvasFile,
	filter: (prev, { file }) => prev?.path !== file?.path,
	fn: (_, { file }) => file,
	target: $canvasFile,
});

const renderCanvasMenu = createEvent<boolean>();

{
	sample({
		clock: onMenuRender,
		source: $canvas,
		fn: (canvas) => canvas?.menu.containerEl.parentElement !== null,
		target: renderCanvasMenu,
	});
	sample({
		clock: renderCanvasMenu,
		source: $canvas,
		filter: (_, hasParent) => hasParent,
		fn: (canvas) =>
			canvas?.selection.size === 1
				? canvas?.selection.values().next()?.value ?? null
				: null,
		target: $node,
	});
}

export const initCanvasMenu = once({
	source: sample({
		clock: renderCanvasMenu,
		filter: (hasParent) => hasParent,
	}),
	reset: [
		sample({
			clock: renderCanvasMenu,
			filter: (hasParent) => !hasParent,
		}),
		$node,
	],
});
