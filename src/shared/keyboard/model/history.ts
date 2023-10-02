import { createStore, Event, sample } from 'effector';

import { hotkeyRaised } from './hotkey';

const LIMIT = 10;

export const $hotkeyHistory = createStore<KeyboardEvent[]>([]);

sample({
  clock: hotkeyRaised,
  source: $hotkeyHistory,
  target: $hotkeyHistory,
  fn: (history, event) => {
    history.push(event);
    if (history.length > LIMIT) {
      history.shift();
    }

    return [...history];
  },
});

/**
 * Hotkeys Combo
 *
 * Usage example:
 * @example
 * const ctrlk = hotkey({ modifiers: 'ctrl', key: 'k', prevent: true, type: 'keydown' });
 * const ctrld = hotkey({ modifiers: 'ctrl', key: 'd', prevent: true, type: 'keydown' });
 *
 * combo([
 *   { key: 'k', ctrl: true },
 *   { key: 'd', ctrl: true }
 * ]).watch(() => console.log('Ctrl+K Ctrl+D'));
 */
export function combo(
  pattern: Array<{
    key: string;
    meta?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
  }>,
): Event<any> {
  if (pattern.length > LIMIT) {
    throw new Error(`Max combo length is ${LIMIT}`);
  }

  const match = sample({
    clock: $hotkeyHistory.updates,
    source: $hotkeyHistory,
    filter: (history) => history.length > 0,
    fn: (history) => {
      if (history.length < pattern.length) {
        return false;
      }

      for (let i = history.length - pattern.length; i < history.length; i++) {
        const event = history[i];

        const { key, alt, shift, ctrl, meta } = pattern[i - (history.length - pattern.length)];

        if (
          (alt ?? false) !== event.altKey ||
          (shift ?? false) !== event.shiftKey ||
          (ctrl ?? false) !== event.ctrlKey ||
          (meta ?? false) !== event.metaKey
        ) {
          return false;
        }

        const keyEqual = () => {
          if (key.toLowerCase() === event.key.toLowerCase()) {
            return true;
          }

          // macos hack
          if (alt && key.length === 1 && event.code.toLowerCase().endsWith(key)) {
            return true;
          }

          return key.toLowerCase() === event.code.toLowerCase();
        };

        if (!keyEqual()) {
          return false;
        }
      }

      return true;
    },
  });

  return sample({
    clock: match,
    filter: (match) => !!match,
  });
}
