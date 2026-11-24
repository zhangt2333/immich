import { isModalOpen } from '@immich/ui';
import { comboStore } from './combos.svelte.ts';
import { currentAsset, isComboEligible, isTypingTarget } from './context.ts';
import { runComboHere } from './execute.ts';
import { isReservedHotkey, matchesHotkey } from './hotkey.ts';

const onKeyDown = (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.isComposing || isModalOpen() || isTypingTarget(event.target)) {
    return;
  }

  const combo = comboStore.combos.find(
    (item) => item.hotkey !== undefined && !isReservedHotkey(item.hotkey) && matchesHotkey(event, item.hotkey),
  );
  if (!combo || !isComboEligible(combo, currentAsset())) {
    return;
  }

  event.preventDefault();

  if (event.repeat) {
    return;
  }

  void runComboHere(combo);
};

export const installHotkeys = () => {
  document.body.addEventListener('keydown', onKeyDown);
  return () => document.body.removeEventListener('keydown', onKeyDown);
};
