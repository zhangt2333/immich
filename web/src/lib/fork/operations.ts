export type OperationType = 'addToAlbum' | 'removeFromAlbum' | 'addTag' | 'removeTag';

export interface Operation {
  type: OperationType;
  targetId: string;
  targetName: string;
}

export const CURRENT_ALBUM_ID = 'CURRENT';

export const operationTypes: OperationType[] = ['addToAlbum', 'removeFromAlbum', 'addTag', 'removeTag'];

export const isAlbumOperation = (type: OperationType) => type === 'addToAlbum' || type === 'removeFromAlbum';

export const resolveOperationTarget = (operation: Operation, currentAlbumId: string | null) =>
  operation.targetId === CURRENT_ALBUM_ID ? currentAlbumId : operation.targetId;
