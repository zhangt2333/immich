import { eventManager } from '#lib/managers/event-manager.svelte.ts';
import { addAssetsToAlbumsMutation, removeAssetFromAlbumMutation } from '#lib/queries/album.query.ts';
import { asMutation, executeMutation } from '#lib/queries/client.ts';
import { untagAssetsMutation } from '#lib/queries/tag.query.ts';
import { getFormatter } from '#lib/utils/i18n.ts';
import { BulkIdErrorReason, tagAssets, type BulkIdResponseDto } from '@immich/sdk';
import { toastManager } from '@immich/ui';
import type { ComboAction } from './config.ts';
import { currentAlbumId, currentAsset, isComboEligible } from './context.ts';
import { resolveOperationTarget, type Operation } from './operations.ts';

export type ComboRunStatus = 'success' | 'partial' | 'failed';

export interface ComboRunResult {
  status: ComboRunStatus;
  successCount: number;
  totalCount: number;
}

let running = false;

const isTolerated = (item: BulkIdResponseDto, tolerated: BulkIdErrorReason[]) =>
  item.success || (item.error !== undefined && tolerated.includes(item.error));

const anySucceeded = (results: BulkIdResponseDto[], tolerated: BulkIdErrorReason[]) =>
  results.some((item) => isTolerated(item, tolerated));

const runOperation = async (operation: Operation, assetId: string, targetId: string) => {
  switch (operation.type) {
    case 'addToAlbum': {
      const added = await executeMutation(() => addAssetsToAlbumsMutation({ notify: false }), {
        albumIds: [targetId],
        assetIds: [assetId],
      });

      if (added === undefined) {
        return false;
      }

      return Array.isArray(added) ? anySucceeded(added, [BulkIdErrorReason.Duplicate]) : added.success;
    }

    case 'removeFromAlbum': {
      const removed = await executeMutation(removeAssetFromAlbumMutation, [
        { id: targetId, bulkIdsDto: { ids: [assetId] } },
      ]);

      const succeeded = removed !== undefined && anySucceeded(removed, [BulkIdErrorReason.NotFound]);
      if (succeeded) {
        eventManager.emit('AlbumRemoveAssets', { assetIds: [assetId], albumIds: [targetId] });
      }

      return succeeded;
    }

    case 'addTag': {
      const tagged = await executeMutation(
        () => asMutation(tagAssets),
        [{ id: targetId, bulkIdsDto: { ids: [assetId] } }],
      );

      const succeeded = tagged !== undefined && anySucceeded(tagged, [BulkIdErrorReason.Duplicate]);
      if (succeeded) {
        eventManager.emit('AssetsTag', [assetId]);
      }

      return succeeded;
    }

    case 'removeTag': {
      const untagged = await executeMutation(untagAssetsMutation, [{ id: targetId, bulkIdsDto: { ids: [assetId] } }]);

      const succeeded = untagged !== undefined && anySucceeded(untagged, [BulkIdErrorReason.NotFound]);
      if (succeeded) {
        eventManager.emit('AssetsTag', [assetId]);
      }

      return succeeded;
    }
  }
};

export const runCombo = async (
  combo: ComboAction,
  assetId: string,
  albumId: string | null,
): Promise<ComboRunResult | undefined> => {
  if (running) {
    return undefined;
  }

  running = true;
  try {
    const $t = await getFormatter();
    const targets = combo.operations.map((operation) => resolveOperationTarget(operation, albumId));
    const totalCount = combo.operations.length;

    if (targets.includes(null)) {
      toastManager.danger($t('fork_combo_current_album_missing'));
      return { status: 'failed', successCount: 0, totalCount };
    }

    const results: boolean[] = [];
    for (const [index, operation] of combo.operations.entries()) {
      results.push(await runOperation(operation, assetId, targets[index]!));
    }

    const successCount = results.filter(Boolean).length;
    const values = { values: { name: combo.label, success: successCount, total: totalCount } };

    if (successCount === totalCount) {
      toastManager.success($t('fork_combo_done', values));
      return { status: 'success', successCount, totalCount };
    }

    if (successCount > 0) {
      toastManager.warning($t('fork_combo_partial', values));
      return { status: 'partial', successCount, totalCount };
    }

    toastManager.danger($t('fork_combo_failed', values));
    return { status: 'failed', successCount, totalCount };
  } finally {
    running = false;
  }
};

export const runComboHere = async (combo: ComboAction) => {
  const $t = await getFormatter();
  const asset = currentAsset();

  if (!asset) {
    toastManager.danger($t('fork_combo_no_asset'));
    return;
  }

  if (!isComboEligible(combo, asset)) {
    toastManager.danger($t('fork_combo_not_eligible'));
    return;
  }

  await runCombo(combo, asset.id, currentAlbumId());
};
