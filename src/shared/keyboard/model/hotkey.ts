import { createEvent, createStore, Event, sample } from "effector";
import { debug, spread } from "patronum";

type ModifierKey = "meta" | "ctrl" | "alt" | "shift";

export const keydown = createEvent<KeyboardEvent>();
export const keyup = createEvent<KeyboardEvent>();
export const keypress = createEvent<KeyboardEvent>();

const keyEvents = { keydown, keyup, keypress };

export const $isShiftDown = createStore(false);
export const $isCtrlDown = createStore(false);
export const $isAltDown = createStore(false);
export const $isMetaDown = createStore(false);

export const hotkeyRaised = createEvent<KeyboardEvent>();

spread({
	source: sample({
		clock: [keyup, keydown],
		fn: ({ shiftKey, ctrlKey, altKey, metaKey }) => ({
			shiftKey,
			ctrlKey,
			altKey,
			metaKey,
		}),
	}),
	targets: {
		shiftKey: $isShiftDown,
		ctrlKey: $isCtrlDown,
		altKey: $isAltDown,
		metaKey: $isMetaDown,
	},
});

export function hotkey({
	modifiers,
	key,
	type,
	repeat,
	prevent,
}: {
	modifiers?: ModifierKey | ModifierKey[];
	key: KeyboardEvent["key"];
	type?: keyof typeof keyEvents;
	repeat?: boolean;
	prevent?: boolean;
}): Event<KeyboardEvent> {
	const _modifiers = Array.isArray(modifiers)
		? modifiers
		: modifiers
		? [modifiers]
		: [];

	const _hotKeyRaised = sample({
		clock: keyEvents[type || "keydown"],
		filter: (event) => {
			if (!repeat && event.repeat) {
				return false;
			}
			if (_modifiers.length) {
				const allModifiers: Record<ModifierKey, undefined | boolean> = {
					meta: event.metaKey
						? _modifiers.includes("meta")
						: undefined,
					ctrl: event.ctrlKey
						? _modifiers.includes("ctrl")
						: undefined,
					alt: event.altKey ? _modifiers.includes("alt") : undefined,
					shift: event.shiftKey
						? _modifiers.includes("shift")
						: undefined,
				};

				const modifiersMasks = Object.values(allModifiers).filter(
					(m) => m !== undefined
				);

				if (modifiersMasks.length !== _modifiers.length) {
					return false;
				}
				if (!modifiersMasks.every(Boolean)) {
					return false;
				}
			}

			if (key.toLowerCase() === event.key.toLowerCase()) {
				return true;
			}

			// macos hack
			if (
				_modifiers.includes("alt") &&
				key.length === 1 &&
				event.code.toLowerCase().endsWith(key)
			) {
				return true;
			}

			return key.toLowerCase() === event.code.toLowerCase();
		},
		fn: (event) => {
			if (prevent) {
				event.preventDefault();
			}

			return event;
		},
	});

	sample({
		clock: _hotKeyRaised,
		target: hotkeyRaised,
	});

	return _hotKeyRaised;
}

export const hotkeys = {
	register() {
		window.addEventListener("keyup", keyup);
		window.addEventListener("keydown", keydown);
		window.addEventListener("keypress", keypress);
	},
	unregister() {
		window.removeEventListener("keyup", keyup);
		window.removeEventListener("keydown", keydown);
		window.removeEventListener("keypress", keypress);
	},
};
