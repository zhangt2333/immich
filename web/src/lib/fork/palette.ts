import { getFormatter } from '#lib/utils/i18n.ts';
import type { ActionProvider } from '@immich/ui';
import { mdiStarFourPoints } from '@mdi/js';
import { comboStore } from './combos.svelte.ts';
import { isForkAvailable } from './context.ts';
import { runComboHere } from './execute.ts';
import { formatHotkey } from './hotkey.ts';

export const comboProvider = (name: string): ActionProvider => ({
  name,
  types: ['quick', 'combo'],
  onSearch: async (query) => {
    if (!isForkAvailable()) {
      return [];
    }

    const $t = await getFormatter();
    const needle = query?.trim().toLowerCase() ?? '';

    return comboStore.combos
      .filter((combo) => !needle || combo.label.toLowerCase().includes(needle))
      .map((combo) => ({
        title: combo.label,
        icon: mdiStarFourPoints,
        ...(combo.hotkey && { description: formatHotkey(combo.hotkey) }),
        onAction: () => void runComboHere(combo),
        text: $t('fork_combos_title'),
      }));
  },
});
