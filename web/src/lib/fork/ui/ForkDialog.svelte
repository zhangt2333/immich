<script lang="ts">
  import { Modal, ModalBody, ModalFooter } from '@immich/ui';
  import { mdiStarFourPoints } from '@mdi/js';
  import type { Snippet } from 'svelte';
  import { t } from 'svelte-i18n';
  import Mark from './Mark.svelte';

  interface Props {
    title: string;
    onClose: () => void;
    size?: 'small' | 'medium' | 'large';
    confirmText?: string;
    confirmDisabled?: boolean;
    onConfirm?: () => void;
    children: Snippet;
  }

  let { title, onClose, size = 'small', confirmText, confirmDisabled = false, onConfirm, children }: Props = $props();
</script>

<Modal {title} {onClose} {size} icon={mdiStarFourPoints} class="border-s-4 border-amber-400">
  <ModalBody>
    <div class="mb-3 flex items-center gap-2" data-fork="dialog">
      <Mark />
      <span class="h-px grow bg-amber-400/40"></span>
    </div>
    {@render children()}
  </ModalBody>

  <ModalFooter>
    <div class="flex w-full items-center justify-end gap-2">
      <button
        type="button"
        class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-500/10 dark:text-gray-300"
        onclick={onClose}
      >
        {$t('close')}
      </button>

      {#if onConfirm}
        <button
          type="button"
          disabled={confirmDisabled}
          class="rounded-md bg-amber-400 px-3 py-1.5 text-sm font-medium text-gray-900 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          onclick={onConfirm}
        >
          {confirmText ?? $t('save')}
        </button>
      {/if}
    </div>
  </ModalFooter>
</Modal>
