import { assetMultiSelectManager } from '#lib/managers/asset-multi-select-manager.svelte.ts';
import { eventManager } from '#lib/managers/event-manager.svelte.ts';
import { addAssetsToAlbumsMutation, removeAssetFromAlbumMutation } from '#lib/queries/album.query.ts';
import { executeMutation } from '#lib/queries/client.ts';
import { restoreAssetsMutation } from '#lib/queries/trash.query.ts';
import { Route } from '#lib/route.ts';
import { getFormatter } from '#lib/utils/i18n.ts';
import { BulkIdErrorReason, type AlbumResponseDto, type BulkIdResponseDto } from '@immich/sdk';
import { toastManager } from '@immich/ui';
import { goto } from '$app/navigation';

const isSatisfied = ({ success, error }: BulkIdResponseDto) =>
  success || error === BulkIdErrorReason.Duplicate || error === BulkIdErrorReason.NotFound;

const countAdded = (added: unknown, expected: number) => {
  if (added === undefined) {
    return 0;
  }

  if (Array.isArray(added)) {
    return (added as BulkIdResponseDto[]).filter(
      ({ success, error }) => success || error === BulkIdErrorReason.Duplicate,
    ).length;
  }

  const response = added as { success: boolean; error?: BulkIdErrorReason };
  return response.success || response.error === BulkIdErrorReason.Duplicate ? expected : 0;
};

export const selectedAssetIds = () => assetMultiSelectManager.assets.map(({ id }) => id);

export const removeFromAlbums = async (albums: AlbumResponseDto[]) => {
  const $t = await getFormatter();
  const ids = selectedAssetIds();
  if (ids.length === 0 || albums.length === 0) {
    return;
  }

  let removed = 0;
  for (const album of albums) {
    const results = await executeMutation(removeAssetFromAlbumMutation, [{ id: album.id, bulkIdsDto: { ids } }]);

    const count = results?.filter((result) => isSatisfied(result)).length ?? 0;
    if (count === 0) {
      continue;
    }

    removed += count;
    eventManager.emit('AlbumRemoveAssets', { assetIds: ids, albumIds: [album.id] });
  }

  if (removed === 0) {
    toastManager.danger($t('fork_remove_from_album_failed'));
    return;
  }

  assetMultiSelectManager.clear();
  toastManager.primary($t('assets_removed_count', { values: { count: removed } }));
};

export const restoreIntoAlbums = async (albums: AlbumResponseDto[]) => {
  const $t = await getFormatter();
  const ids = selectedAssetIds();
  const [album] = albums;
  if (ids.length === 0 || !album) {
    return;
  }

  const restored = await executeMutation(restoreAssetsMutation, [{ bulkIdsDto: { ids } }]);
  if (restored === undefined) {
    return;
  }

  let addedCount = 0;
  let firstAcceptedAlbumId: string | undefined;
  for (const { id: albumId } of albums) {
    const added = await executeMutation(() => addAssetsToAlbumsMutation({ notify: false }), {
      albumIds: [albumId],
      assetIds: ids,
    });

    const accepted = countAdded(added, ids.length);
    addedCount += accepted;
    if (accepted > 0 && !firstAcceptedAlbumId) {
      firstAcceptedAlbumId = albumId;
    }
  }

  assetMultiSelectManager.clear();

  const expectedCount = ids.length * albums.length;
  if (!firstAcceptedAlbumId) {
    toastManager.danger($t('fork_restore_to_album_failed', { values: { name: album.albumName } }));
    return;
  }

  if (addedCount < expectedCount) {
    toastManager.warning(
      $t('fork_restore_to_album_partial', { values: { success: addedCount, total: expectedCount } }),
    );
  } else if (albums.length === 1) {
    toastManager.primary($t('fork_restore_to_album_done', { values: { name: album.albumName, count: ids.length } }));
  } else {
    toastManager.primary(
      $t('fork_restore_to_album_done_multi', { values: { count: albums.length, assetCount: ids.length } }),
    );
  }

  await goto(Route.viewAlbum({ id: firstAcceptedAlbumId }));
};

export const openComboManager = () => goto(Route.forkCombos());
