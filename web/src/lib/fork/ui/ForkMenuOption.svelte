<script lang="ts">
  import { Icon } from '@immich/ui';
  import { mdiStarFourPoints } from '@mdi/js';

  interface Props {
    text: string;
    shortcut?: string;
    onclick: (event: MouseEvent) => void;
  }

  let { text, shortcut, onclick }: Props = $props();
</script>

<li class="border-s-2 border-amber-400 bg-amber-400/5 hover:bg-amber-400/15" data-fork="menu-item">
  <button
    type="button"
    class="flex w-full cursor-pointer items-center gap-2 p-4 text-start text-sm font-medium text-amber-800 focus:ring-2 focus:ring-amber-400/50 focus:outline-none focus:ring-inset dark:text-amber-200"
    {onclick}
  >
    <Icon icon={mdiStarFourPoints} size="18" />
    <span class="grow">{text}</span>
    {#if shortcut}
      <span class="text-xs font-normal text-amber-700/80 dark:text-amber-200/70">{shortcut}</span>
    {/if}
  </button>
</li>
