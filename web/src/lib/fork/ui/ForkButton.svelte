<script lang="ts">
  import { Icon } from '@immich/ui';
  import type { Snippet } from 'svelte';

  interface Props {
    onclick: (event: MouseEvent) => void;
    icon?: string;
    variant?: 'solid' | 'soft';
    disabled?: boolean;
    title?: string;
    grow?: boolean;
    children: Snippet;
  }

  let { onclick, icon, variant = 'soft', disabled = false, title, grow = false, children }: Props = $props();
</script>

<button
  type="button"
  {onclick}
  {disabled}
  {title}
  class="inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 {grow
    ? 'w-full'
    : ''} {variant === 'solid'
    ? 'border-amber-400 bg-amber-400 text-gray-900 hover:bg-amber-300'
    : 'border-amber-400/50 bg-amber-400/10 text-amber-800 hover:bg-amber-400/20 dark:text-amber-200'}"
  data-fork="button"
>
  {#if icon}
    <Icon {icon} size="16" />
  {/if}
  {@render children()}
</button>
