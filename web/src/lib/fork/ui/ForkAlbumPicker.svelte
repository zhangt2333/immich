<script lang="ts">
  import { assetMultiSelectManager } from '#lib/managers/asset-multi-select-manager.svelte.ts';
  import { getAllAlbumsQuery } from '#lib/queries/album.query.ts';
  import { queryClient } from '#lib/queries/client.ts';
  import { isAlbumEditor } from '#lib/services/album.service.ts';
  import type { AlbumResponseDto } from '@immich/sdk';
  import { Icon, Input, Text } from '@immich/ui';
  import { mdiImageAlbum } from '@mdi/js';
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from 'svelte-i18n';
  import ForkDialog from './ForkDialog.svelte';

  interface Props {
    title: string;
    multiple?: boolean;
    onClose: (albums?: AlbumResponseDto[]) => void;
  }

  let { title, multiple = false, onClose }: Props = $props();

  const albumsQuery = createQuery(getAllAlbumsQuery, () => queryClient);
  const albums = $derived(
    (albumsQuery.data ?? []).filter((album) => isAlbumEditor(album) || assetMultiSelectManager.isAllUserOwned),
  );

  let search = $state('');
  let selectedIds = $state<string[]>([]);

  const filtered = $derived(
    albums.filter(({ albumName }) => albumName.toLowerCase().includes(search.trim().toLowerCase())),
  );

  const toggle = (album: AlbumResponseDto) => {
    if (!multiple) {
      onClose([album]);
      return;
    }

    selectedIds = selectedIds.includes(album.id)
      ? selectedIds.filter((id) => id !== album.id)
      : [...selectedIds, album.id];
  };

  const confirm = () => {
    const chosen = albums.filter(({ id }) => selectedIds.includes(id));
    onClose(chosen.length > 0 ? chosen : undefined);
  };
</script>

<ForkDialog
  {title}
  {onClose}
  size="small"
  confirmText={$t('choose')}
  confirmDisabled={selectedIds.length === 0}
  onConfirm={multiple ? confirm : undefined}
>
  <div class="flex flex-col gap-3">
    <Input bind:value={search} placeholder={$t('fork_album_picker_search')} />

    {#if albumsQuery.isPending}
      <Text size="small" color="muted">{$t('loading')}</Text>
    {:else if filtered.length === 0}
      <Text size="small" color="muted">{$t('fork_album_picker_empty')}</Text>
    {:else}
      <ul class="flex max-h-80 flex-col gap-1 overflow-y-auto">
        {#each filtered as album (album.id)}
          {const selected = $derived(selectedIds.includes(album.id))}
          <li>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-md border px-3 py-2 text-start transition-colors {selected
                ? 'border-amber-400 bg-amber-400/15'
                : 'border-transparent hover:bg-amber-400/10'}"
              onclick={() => toggle(album)}
            >
              <Icon icon={mdiImageAlbum} size="20" class="text-amber-600 dark:text-amber-300" />
              <span class="grow truncate text-sm">{album.albumName}</span>
              <Text size="small" color="muted">{album.assetCount}</Text>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</ForkDialog>
