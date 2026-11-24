import type { KeyCombo } from './config.ts';

const withCtrl = (event: Pick<KeyboardEvent, 'ctrlKey' | 'altKey' | 'metaKey'>) => ({
  ctrl: event.ctrlKey || event.metaKey,
  alt: event.altKey,
});

export const isHotkey = (a: KeyCombo, b: KeyCombo) =>
  a.key.toLowerCase() === b.key.toLowerCase() && a.ctrl === b.ctrl && a.alt === b.alt && a.shift === b.shift;

export const matchesHotkey = (event: KeyboardEvent, hotkey: KeyCombo) =>
  isHotkey({ key: event.key, ...withCtrl(event), shift: event.shiftKey }, hotkey);

export const hasModifier = (hotkey: KeyCombo) => hotkey.ctrl || hotkey.alt;

export const formatHotkey = (hotkey?: KeyCombo) => {
  if (!hotkey) {
    return '';
  }

  const parts: string[] = [];
  if (hotkey.ctrl) {
    parts.push('Ctrl');
  }
  if (hotkey.alt) {
    parts.push('Alt');
  }
  if (hotkey.shift) {
    parts.push('Shift');
  }
  parts.push(hotkey.key.toUpperCase());

  return parts.join('+');
};

const MODIFIER_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta', 'CapsLock', 'Tab', 'Dead']);

const RESERVED_HOTKEYS: KeyCombo[] = [
  { key: 'A', ctrl: true, alt: false, shift: false },
  { key: 'C', ctrl: true, alt: false, shift: false },
  { key: 'D', ctrl: true, alt: false, shift: false },
  { key: 'Enter', ctrl: true, alt: false, shift: false },
  { key: 'K', ctrl: true, alt: false, shift: false },
  { key: 'M', ctrl: true, alt: false, shift: true },
];

export const isReservedHotkey = (hotkey: KeyCombo) => RESERVED_HOTKEYS.some((reserved) => isHotkey(reserved, hotkey));

export const fromKeyboardEvent = (event: KeyboardEvent): KeyCombo | undefined => {
  if (MODIFIER_KEYS.has(event.key)) {
    return undefined;
  }

  return { key: event.key, ...withCtrl(event), shift: event.shiftKey };
};
