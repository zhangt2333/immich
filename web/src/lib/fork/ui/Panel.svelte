<script lang="ts">
  import { assetMultiSelectManager } from '#lib/managers/asset-multi-select-manager.svelte.ts';
  import { Icon, Text, modalManager } from '@immich/ui';
  import { mdiCogOutline, mdiHistory, mdiImageRemoveOutline, mdiStarFourPoints } from '@mdi/js';
  import { t } from 'svelte-i18n';
  import { get } from 'svelte/store';
  import { comboStore } from '../combos.svelte.ts';
  import { currentAsset, isComboEligible } from '../context.ts';
  import { runComboHere } from '../execute.ts';
  import { openComboManager, removeFromAlbums, restoreIntoAlbums, selectedAssetIds } from '../flows.ts';
  import { formatHotkey } from '../hotkey.ts';
  import ForkAlbumPicker from './ForkAlbumPicker.svelte';
  import ForkButton from './ForkButton.svelte';
  import Mark from './Mark.svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
  }

  let { open, onclose }: Props = $props();

  const picker = (title: string) => modalManager.show(ForkAlbumPicker, { title, multiple: true });

  const removeFromAlbum = async () => {
    const translate = get(t);
    const ids = selectedAssetIds();
    const albums = await picker(translate('fork_remove_from_album_title', { values: { count: ids.length } }));
    if (!albums || albums.length === 0) {
      return;
    }

    const confirmed = await modalManager.showDialog({
      title: translate('remove_from_album'),
      prompt: translate('fork_remove_from_album_confirm', {
        values: { count: ids.length, name: albums.map(({ albumName }) => albumName).join(', ') },
      }),
      confirmText: translate('fork_remove'),
    });
    if (!confirmed) {
      return;
    }

    await removeFromAlbums(albums);
  };

  const restoreToAlbum = async () => {
    const translate = get(t);
    const ids = selectedAssetIds();
    const albums = await picker(translate('fork_restore_to_album_title', { values: { count: ids.length } }));
    if (!albums || albums.length === 0) {
      return;
    }

    await restoreIntoAlbums(albums);
  };

  const asset = $derived(currentAsset());
  const selectionActive = $derived(assetMultiSelectManager.selectionActive);
  const combos = $derived(comboStore.combos.map((combo) => ({ combo, eligible: isComboEligible(combo, asset) })));
</script>

{#if open}
  <section
    class="fixed inset-e-5 bottom-24 z-40 flex max-h-[70vh] w-80 flex-col overflow-hidden rounded-xl border border-amber-400/50 bg-light shadow-2xl dark:bg-immich-dark-gray"
    data-fork="panel"
  >
    <header class="flex items-center gap-2 border-b border-amber-400/40 bg-amber-400/10 px-4 py-3">
      <Icon class="text-amber-600 dark:text-amber-300" icon={mdiStarFourPoints} size="18" />
      <span class="grow text-sm font-semibold">{$t('fork_combos_title')}</span>
      <Mark />
      <button
        type="button"
        aria-label={$t('close')}
        class="rounded-md p-1 text-gray-500 hover:bg-gray-500/10 dark:text-gray-400"
        onclick={onclose}
      >
        ✕
      </button>
    </header>

    <div class="flex flex-col gap-1 overflow-y-auto p-3">
      {#if combos.length === 0}
        <Text size="small" color="muted">{$t('fork_combo_empty')}</Text>
      {:else}
        {#each combos as { combo, eligible } (combo.id)}
          <button
            type="button"
            disabled={!eligible}
            onclick={() => {
              onclose();
              void runComboHere(combo);
            }}
            class="flex items-center gap-2 rounded-md border border-transparent px-2.5 py-2 text-start text-sm transition-colors hover:enabled:border-amber-400/50 hover:enabled:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon class="text-amber-600 dark:text-amber-300" icon={mdiStarFourPoints} size="16" />
            <span class="grow truncate">{combo.label}</span>
            {#if combo.hotkey}
              <span class="text-[11px] text-amber-700/80 dark:text-amber-200/70">{formatHotkey(combo.hotkey)}</span>
            {/if}
          </button>
        {/each}
      {/if}
    </div>

    <div class="flex flex-col gap-1.5 border-t border-amber-400/30 p-3">
      <p class="text-[10px] font-semibold tracking-[0.08em] text-amber-700 uppercase dark:text-amber-300">
        {$t('fork_panel_selection')}
      </p>

      <ForkButton
        icon={mdiImageRemoveOutline}
        grow
        disabled={!selectionActive}
        title={$t('fork_remove_from_album_hint')}
        onclick={() => {
          onclose();
          void removeFromAlbum();
        }}
      >
        {$t('remove_from_album')}
      </ForkButton>

      <ForkButton
        icon={mdiHistory}
        grow
        disabled={!selectionActive}
        title={$t('fork_restore_to_album_hint')}
        onclick={() => {
          onclose();
          void restoreToAlbum();
        }}
      >
        {$t('fork_restore_to_album')}
      </ForkButton>

      <ForkButton
        icon={mdiCogOutline}
        grow
        onclick={() => {
          onclose();
          void openComboManager();
        }}
      >
        {$t('fork_manage')}
      </ForkButton>
    </div>
  </section>
{/if}
