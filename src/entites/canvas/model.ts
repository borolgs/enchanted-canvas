import { Menu, Point, TFile } from "obsidian";
import { Canvas, CanvasEdge, CanvasNode, Size } from "../../shared/types";
import { createEvent, createStore, sample } from "effector";
import { debug } from "patronum";

export const canvasLoaded = createEvent<{ canvas: Canvas; file: TFile }>();
export const canvasChanged = createEvent<{ file: TFile }>();

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

export const $canvas = createStore<Canvas | null>(null);
export const $canvasFile = createStore<TFile | null>(null);

sample({
	clock: canvasLoaded,
	fn: ({ canvas }) => canvas,
	target: $canvas,
});
sample({
	clock: canvasChanged,
	source: $canvasFile,
	filter: (prev, { file }) => prev?.path !== file?.path,
	fn: (_, { file }) => file,
	target: $canvasFile,
});

debug(
	onConnectionMenu,
	onEdgeMenu,
	onNodeMenu,
	onSelectionMenu,
	onCreationMenu
);
