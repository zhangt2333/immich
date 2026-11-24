<script lang="ts">
  import { getAllAlbumsQuery } from '#lib/queries/album.query.ts';
  import { queryClient } from '#lib/queries/client.ts';
  import { getAllTagsQuery } from '#lib/queries/tag.query.ts';
  import { isAlbumEditor } from '#lib/services/album.service.ts';
  import { Field, IconButton, Input, Select } from '@immich/ui';
  import { mdiClose, mdiPlus, mdiStarFourPoints } from '@mdi/js';
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from 'svelte-i18n';
  import { comboStore } from '../combos.svelte.ts';
  import { newComboId, type ComboAction, type KeyCombo } from '../config.ts';
  import { formatHotkey, fromKeyboardEvent, hasModifier, isReservedHotkey } from '../hotkey.ts';
  import {
    CURRENT_ALBUM_ID,
    isAlbumOperation,
    operationTypes,
    type Operation,
    type OperationType,
  } from '../operations.ts';
  import ForkButton from './ForkButton.svelte';
  import ForkDialog from './ForkDialog.svelte';

  interface Props {
    combo?: ComboAction;
    onClose: (combo?: ComboAction) => void;
  }

  let { combo, onClose }: Props = $props();

  const albumsQuery = createQuery(getAllAlbumsQuery, () => queryClient);
  const tagsQuery = createQuery(getAllTagsQuery, () => queryClient);
  const albums = $derived((albumsQuery.data ?? []).filter((album) => isAlbumEditor(album)));
  const tags = $derived(tagsQuery.data ?? []);

  let label = $state(combo?.label ?? '');
  let hotkey = $state<KeyCombo | undefined>(combo?.hotkey);
  let operations = $state<Operation[]>(combo ? combo.operations.map((operation) => ({ ...operation })) : []);
  let capturing = $state(false);
  let error = $state('');

  let targetFilter = $state('');

  const allAlbumOptions = $derived([
    { value: CURRENT_ALBUM_ID, label: $t('fork_combo_current_album') },
    ...albums.map((album) => ({ value: album.id, label: album.albumName })),
  ]);

  const allTagOptions = $derived(tags.map((tag) => ({ value: tag.id, label: tag.value })));

  const operationOptions = $derived(
    operationTypes.map((type) => ({
      value: type,
      label: $t(
        isAlbumOperation(type)
          ? type === 'addToAlbum'
            ? 'fork_operation_add_to_album'
            : 'fork_operation_remove_from_album'
          : type === 'addTag'
            ? 'fork_operation_add_tag'
            : 'fork_operation_remove_tag',
      ),
    })),
  );

  const allOptionsFor = (type: OperationType) => (isAlbumOperation(type) ? allAlbumOptions : allTagOptions);

  const matchesFilter = (label: string) => label.toLowerCase().includes(targetFilter.trim().toLowerCase());

  const optionsFor = (type: OperationType) => allOptionsFor(type).filter(({ label }) => matchesFilter(label));

  const albumsLoaded = $derived(albumsQuery.data !== undefined);
  const tagsLoaded = $derived(tagsQuery.data !== undefined);

  const isKnownTarget = (operation: Operation) => {
    const loaded = isAlbumOperation(operation.type) ? albumsLoaded : tagsLoaded;
    if (!loaded) {
      return true;
    }

    return (
      operation.targetId.length > 0 &&
      allOptionsFor(operation.type).some((option) => option.value === operation.targetId)
    );
  };

  const changeType = (index: number, type: OperationType) => {
    const first = allOptionsFor(type)[0];
    operations[index] = { type, targetId: first?.value ?? '', targetName: first?.label ?? '' };
  };

  const changeTarget = (index: number, targetId: string) => {
    const option = allOptionsFor(operations[index].type).find((item) => item.value === targetId);
    operations[index] = { ...operations[index], targetId, targetName: option?.label ?? targetId };
  };

  const addOperation = () => {
    const first = allOptionsFor('addToAlbum')[0];
    operations = [...operations, { type: 'addToAlbum', targetId: first?.value ?? '', targetName: first?.label ?? '' }];
  };

  const removeOperation = (index: number) => {
    operations = operations.filter((_, itemIndex) => itemIndex !== index);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!capturing) {
      return;
    }

    if (event.key === 'Tab') {
      capturing = false;
      return;
    }

    if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      capturing = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      capturing = false;
      return;
    }

    const next = fromKeyboardEvent(event);
    if (!next) {
      return;
    }

    if (!hasModifier(next)) {
      error = $t('fork_combo_hotkey_requires_modifier');
      return;
    }

    if (isReservedHotkey(next)) {
      error = $t('fork_combo_hotkey_reserved');
      return;
    }

    hotkey = next;
    capturing = false;
    error = '';
  };

  $effect(() => {
    if (!capturing) {
      return;
    }

    addEventListener('keydown', handleKeyDown, { capture: true });
    return () => removeEventListener('keydown', handleKeyDown, { capture: true });
  });

  const onSubmit = () => {
    if (!label.trim()) {
      error = $t('fork_combo_name_required');
      return;
    }

    if (operations.length === 0) {
      error = $t('fork_combo_empty_operations');
      return;
    }

    if (operations.some((operation) => !operation.targetId)) {
      error = $t('fork_combo_target_required');
      return;
    }

    if (operations.some((operation) => !isKnownTarget(operation))) {
      error = $t('fork_combo_target_missing');
      return;
    }

    if (hotkey) {
      if (isReservedHotkey(hotkey)) {
        error = $t('fork_combo_hotkey_reserved');
        return;
      }

      const conflict = comboStore.findHotkeyConflict(hotkey, combo?.id);
      if (conflict) {
        error = $t('fork_combo_hotkey_conflict', { values: { name: conflict.label } });
        return;
      }
    }

    onClose({
      id: combo?.id ?? newComboId(),
      label: label.trim(),
      operations: operations.map((operation) => ({ ...operation })),
      ...(hotkey && { hotkey }),
    });
  };
</script>

<ForkDialog
  title={combo ? $t('fork_combo_edit') : $t('fork_combo_new')}
  onClose={() => onClose()}
  size="medium"
  confirmText={$t('save')}
  onConfirm={onSubmit}
>
  <div class="flex flex-col gap-4">
    <Field label={$t('fork_combo_name')}>
      <Input bind:value={label} placeholder={$t('fork_combo_name_placeholder')} />
    </Field>

    <Field label={$t('fork_combo_hotkey')}>
      <div class="flex items-center gap-2">
        <ForkButton icon={mdiStarFourPoints} variant={capturing ? 'solid' : 'soft'} onclick={() => (capturing = true)}>
          {hotkey ? formatHotkey(hotkey) : $t('fork_combo_hotkey_capture')}
        </ForkButton>

        {#if hotkey}
          <IconButton
            icon={mdiClose}
            aria-label={$t('fork_combo_hotkey_clear')}
            size="small"
            shape="round"
            color="secondary"
            variant="ghost"
            onclick={() => (hotkey = undefined)}
          />
        {/if}
      </div>
    </Field>

    <div class="flex flex-col gap-2">
      <p class="text-sm font-medium">{$t('fork_combo_operations')}</p>

      <Input bind:value={targetFilter} placeholder={$t('fork_combo_filter_targets')} />

      {#each operations as operation, index (index)}
        <div class="flex items-center gap-2 border-s-2 border-amber-400/50 ps-2">
          <Select
            size="small"
            options={operationOptions}
            value={operation.type}
            onChange={(type) => changeType(index, type)}
          />
          <Select
            size="small"
            options={optionsFor(operation.type)}
            value={operation.targetId}
            onChange={(targetId) => changeTarget(index, targetId)}
          />
          <IconButton
            icon={mdiClose}
            aria-label={$t('fork_remove')}
            size="small"
            shape="round"
            color="secondary"
            variant="ghost"
            onclick={() => removeOperation(index)}
          />
        </div>
      {/each}

      <ForkButton icon={mdiPlus} onclick={addOperation}>{$t('fork_combo_add_operation')}</ForkButton>
    </div>

    {#if error}
      <p class="text-sm text-red-500">{error}</p>
    {/if}
  </div>
</ForkDialog>
