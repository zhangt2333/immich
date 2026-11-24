<script lang="ts">
  import { Icon } from '@immich/ui';
  import { mdiStarFourPoints } from '@mdi/js';
  import { t } from 'svelte-i18n';

  interface Props {
    open: boolean;
    ontoggle: () => void;
  }

  let { open, ontoggle }: Props = $props();
</script>

<button
  type="button"
  aria-label={$t('fork_combos_title')}
  aria-expanded={open}
  onclick={ontoggle}
  class="fixed inset-e-5 bottom-5 z-40 grid size-13 place-items-center rounded-full border shadow-lg transition-transform hover:scale-105 {open
    ? 'border-amber-300 bg-amber-300 text-gray-900'
    : 'border-amber-400/70 bg-amber-400 text-gray-900'}"
  data-fork="fab"
>
  <Icon icon={mdiStarFourPoints} size="26" />
</button>
