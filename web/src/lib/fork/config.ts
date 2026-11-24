import { operationTypes, type Operation, type OperationType } from './operations.ts';

export interface KeyCombo {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
}

export interface ComboAction {
  id: string;
  label: string;
  hotkey?: KeyCombo;
  operations: Operation[];
}

export const STORAGE_KEY = 'fork.combos';
export const MAX_COMBOS = 10;

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;

const parseOperationType = (value: unknown): OperationType | undefined => operationTypes.find((type) => type === value);

const parseOperation = (value: unknown): Operation | undefined => {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const type = parseOperationType(record.type);
  const targetId = typeof record.targetId === 'string' ? record.targetId : '';
  if (!type || !targetId) {
    return undefined;
  }

  return { type, targetId, targetName: typeof record.targetName === 'string' ? record.targetName : targetId };
};

const parseHotkey = (value: unknown): KeyCombo | undefined => {
  const record = asRecord(value);
  if (!record || typeof record.key !== 'string' || record.key.length === 0) {
    return undefined;
  }

  return { key: record.key, ctrl: record.ctrl === true, alt: record.alt === true, shift: record.shift === true };
};

const parseCombo = (value: unknown): ComboAction | undefined => {
  const record = asRecord(value);
  if (!record || typeof record.id !== 'string' || typeof record.label !== 'string') {
    return undefined;
  }

  const operations = Array.isArray(record.operations)
    ? record.operations.map((operation) => parseOperation(operation))
    : [];

  const validOperations = operations.filter((operation): operation is Operation => operation !== undefined);
  if (validOperations.length === 0) {
    return undefined;
  }

  const hotkey = parseHotkey(record.hotkey);
  return { id: record.id, label: record.label, operations: validOperations, ...(hotkey && { hotkey }) };
};

export const loadCombos = (storage?: Storage): ComboAction[] => {
  try {
    const target = storage ?? localStorage;
    const raw = target.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((combo) => parseCombo(combo))
      .filter((combo): combo is ComboAction => combo !== undefined)
      .slice(0, MAX_COMBOS);
  } catch {
    return [];
  }
};

export const saveCombos = (combos: ComboAction[], storage?: Storage) => {
  try {
    const target = storage ?? localStorage;
    target.setItem(STORAGE_KEY, JSON.stringify(combos.slice(0, MAX_COMBOS)));
    return true;
  } catch {
    return false;
  }
};

const randomHex = (bytes: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (byte) => byte.toString(16).padStart(2, '0')).join('');

export const newComboId = () =>
  typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `combo-${randomHex(8)}`;
