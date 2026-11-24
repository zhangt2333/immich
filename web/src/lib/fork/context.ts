import { assetMultiSelectManager } from '#lib/managers/asset-multi-select-manager.svelte.ts';
import { assetViewerManager } from '#lib/managers/asset-viewer-manager.svelte.ts';
import { authManager } from '#lib/managers/auth-manager.svelte.ts';
import { AssetVisibility } from '@immich/sdk';
import type { ComboAction } from './config.ts';
import { displayed } from './displayed.svelte.ts';
import { isAlbumOperation } from './operations.ts';

export interface ComboAsset {
  id: string;
  visibility: AssetVisibility;
  isTrashed: boolean;
}

const ALBUM_PATH = /^\/albums\/([^/]+)/;

export const currentAlbumId = (pathname: string = location.pathname) => ALBUM_PATH.exec(pathname)?.[1] ?? null;

export const currentAsset = (): ComboAsset | undefined => {
  const shown = assetViewerManager.isViewing ? displayed.asset : undefined;
  if (shown) {
    return shown;
  }

  const viewed = assetViewerManager.isViewing ? assetViewerManager.asset : undefined;
  if (viewed) {
    return { id: viewed.id, visibility: viewed.visibility, isTrashed: viewed.isTrashed };
  }

  const selected = assetMultiSelectManager.assets;
  if (selected.length !== 1) {
    return undefined;
  }

  const [asset] = selected;
  return { id: asset.id, visibility: asset.visibility, isTrashed: asset.isTrashed };
};

export const isForkAvailable = () => authManager.authenticated && !authManager.isSharedLink;

export const isTagsEnabled = () => isForkAvailable() && authManager.preferences.tags.enabled;

export const isAssetEligible = (asset?: ComboAsset) =>
  asset !== undefined && !asset.isTrashed && asset.visibility !== AssetVisibility.Locked;

export const isComboEligible = (combo: ComboAction, asset?: ComboAsset) =>
  isForkAvailable() &&
  isAssetEligible(asset) &&
  combo.operations.every((operation) => isAlbumOperation(operation.type) || isTagsEnabled());

export const isTypingTarget = (target: EventTarget | null) => {
  const element = target as HTMLElement | null;
  if (!element || typeof element.tagName !== 'string') {
    return false;
  }

  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) || element.isContentEditable;
};
