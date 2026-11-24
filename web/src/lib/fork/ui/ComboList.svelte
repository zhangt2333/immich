<script lang="ts">
  import { getFormatter } from '#lib/utils/i18n.ts';
  import { Icon, IconButton, Text, modalManager, toastManager } from '@immich/ui';
  import { mdiArrowDown, mdiArrowUp, mdiPencil, mdiPlus, mdiStarFourPoints, mdiTrashCanOutline } from '@mdi/js';
  import { t } from 'svelte-i18n';
  import { comboStore } from '../combos.svelte.ts';
  import { MAX_COMBOS, type ComboAction } from '../config.ts';
  import { formatHotkey } from '../hotkey.ts';
  import ComboEditor from './ComboEditor.svelte';
  import ForkButton from './ForkButton.svelte';
  import Mark from './Mark.svelte';

  const openEditor = async (combo?: ComboAction) => {
    const $t = await getFormatter();

    if (!combo && comboStore.combos.length >= MAX_COMBOS) {
      toastManager.danger($t('fork_combo_limit', { values: { count: MAX_COMBOS } }));
      return;
    }

    const result = await modalManager.show(ComboEditor, { combo });
    if (!result) {
      return;
    }

    const saved = combo ? comboStore.update(result) : comboStore.create(result);
    if (!saved) {
      toastManager.danger($t('fork_combo_storage_failed'));
      return;
    }

    toastManager.success($t('fork_combo_saved'));
  };

  const moveCombo = async (id: string, direction: 'up' | 'down') => {
    if (comboStore.move(id, direction)) {
      return;
    }

    const $t = await getFormatter();
    toastManager.danger($t('fork_combo_storage_failed'));
  };

  const removeCombo = async (combo: ComboAction) => {
    const $t = await getFormatter();
    const confirmed = await modalManager.showDialog({
      title: $t('delete'),
      prompt: $t('fork_combo_delete_confirm', { values: { name: combo.label } }),
      confirmText: $t('delete'),
    });

    if (!confirmed) {
      return;
    }

    if (!comboStore.remove(combo.id)) {
      toastManager.danger($t('fork_combo_storage_failed'));
      return;
    }

    toastManager.primary($t('fork_combo_deleted'));
  };
</script>

<div class="flex flex-col gap-4" data-fork="combo-list">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Text class="text-lg">{$t('fork_combos_title')}</Text>
      <Mark />
    </div>

    <ForkButton
      icon={mdiPlus}
      variant="solid"
      disabled={comboStore.combos.length >= MAX_COMBOS}
      onclick={() => void openEditor()}
    >
      {$t('fork_combo_new')}
    </ForkButton>
  </div>

  <Text size="small" color="muted">{$t('fork_combos_description')}</Text>

  {#if comboStore.combos.length === 0}
    <div class="flex flex-col items-center gap-2 py-10">
      <Text color="muted">{$t('fork_combo_empty')}</Text>
    </div>
  {:else}
    <ul class="flex flex-col gap-2">
      {#each comboStore.combos as combo, index (combo.id)}
        <li class="flex items-center justify-between border-s-2 border-amber-400/60 bg-amber-400/5 px-4 py-3">
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <Icon class="text-amber-600 dark:text-amber-300" icon={mdiStarFourPoints} size="18" />
              <Text>{combo.label}</Text>
              {#if combo.hotkey}
                <Text size="small" color="muted">{formatHotkey(combo.hotkey)}</Text>
              {/if}
            </div>
            <Text size="small" color="muted">
              {$t('fork_combo_operations_count', { values: { count: combo.operations.length } })}
            </Text>
          </div>

          <div class="flex items-center gap-1">
            <IconButton
              icon={mdiArrowUp}
              aria-label={$t('fork_combo_move_up')}
              size="small"
              shape="round"
              color="secondary"
              variant="ghost"
              disabled={index === 0}
              onclick={() => void moveCombo(combo.id, 'up')}
            />
            <IconButton
              icon={mdiArrowDown}
              aria-label={$t('fork_combo_move_down')}
              size="small"
              shape="round"
              color="secondary"
              variant="ghost"
              disabled={index === comboStore.combos.length - 1}
              onclick={() => void moveCombo(combo.id, 'down')}
            />
            <IconButton
              icon={mdiPencil}
              aria-label={$t('edit')}
              size="small"
              shape="round"
              color="secondary"
              variant="ghost"
              onclick={() => void openEditor(combo)}
            />
            <IconButton
              icon={mdiTrashCanOutline}
              aria-label={$t('delete')}
              size="small"
              shape="round"
              color="danger"
              variant="ghost"
              onclick={() => void removeCombo(combo)}
            />
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
