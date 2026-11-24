<script lang="ts">
  import { CommandPaletteProvider } from '@immich/ui';
  import { onMount } from 'svelte';
  import { t } from 'svelte-i18n';
  import { isForkAvailable } from './context.ts';
  import { installHotkeys } from './hotkeys.ts';
  import { comboProvider } from './palette.ts';
  import Fab from './ui/Fab.svelte';
  import Panel from './ui/Panel.svelte';

  let open = $state(false);

  const provider = $derived(comboProvider($t('fork_combos_title')));

  onMount(() => installHotkeys());
</script>

<CommandPaletteProvider providers={[provider]} />

{#if isForkAvailable()}
  <Panel {open} onclose={() => (open = false)} />
  <Fab {open} ontoggle={() => (open = !open)} />
{/if}
