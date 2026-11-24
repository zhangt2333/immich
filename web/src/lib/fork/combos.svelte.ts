import { MAX_COMBOS, loadCombos, saveCombos, type ComboAction, type KeyCombo } from './config.ts';
import { isHotkey } from './hotkey.ts';

class ComboStore {
  combos = $state<ComboAction[]>([]);
  #loaded = false;

  load() {
    if (this.#loaded) {
      return;
    }

    this.combos = loadCombos();
    this.#loaded = true;
  }

  create(combo: ComboAction) {
    if (this.combos.length >= MAX_COMBOS) {
      return false;
    }

    const next = [...this.combos, combo];
    if (!saveCombos(next)) {
      return false;
    }

    this.combos = next;
    return true;
  }

  update(combo: ComboAction) {
    const next = this.combos.map((item) => (item.id === combo.id ? combo : item));
    if (!saveCombos(next)) {
      return false;
    }

    this.combos = next;
    return true;
  }

  remove(id: string) {
    const next = this.combos.filter((combo) => combo.id !== id);
    if (!saveCombos(next)) {
      return false;
    }

    this.combos = next;
    return true;
  }

  move(id: string, direction: 'up' | 'down') {
    const index = this.combos.findIndex((combo) => combo.id === id);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || target < 0 || target >= this.combos.length) {
      return false;
    }

    const next = [...this.combos];
    const moved = next[index];
    next[index] = next[target];
    next[target] = moved;

    if (!saveCombos(next)) {
      return false;
    }

    this.combos = next;
    return true;
  }

  findHotkeyConflict(hotkey: KeyCombo, excludeId?: string) {
    return this.combos.find(
      (combo) => combo.id !== excludeId && combo.hotkey !== undefined && isHotkey(combo.hotkey, hotkey),
    );
  }
}

export const comboStore = new ComboStore();
