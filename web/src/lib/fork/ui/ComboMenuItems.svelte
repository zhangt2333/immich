<script lang="ts">
  import { Route } from '#lib/route.ts';
  import { t } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { comboStore } from '../combos.svelte.ts';
  import { isComboEligible, isForkAvailable, type ComboAsset } from '../context.ts';
  import { runCombo } from '../execute.ts';
  import { formatHotkey } from '../hotkey.ts';
  import ForkMenuOption from './ForkMenuOption.svelte';

  interface Props {
    asset: ComboAsset;
    albumId: string | null;
  }

  let { asset, albumId }: Props = $props();

  const combos = $derived(comboStore.combos.filter((combo) => isComboEligible(combo, asset)));
</script>

{#if isForkAvailable()}
  <hr />

  {#if combos.length > 0}
    <li
      class="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-[0.08em] text-amber-700 uppercase dark:text-amber-300"
      data-fork="menu-header"
    >
      {$t('fork_combos_title')}
    </li>

    {#each combos as combo (combo.id)}
      <ForkMenuOption
        text={combo.label}
        shortcut={formatHotkey(combo.hotkey)}
        onclick={() => void runCombo(combo, asset.id, albumId)}
      />
    {/each}
  {/if}

  <ForkMenuOption text={$t('fork_manage')} onclick={() => void goto(Route.forkCombos())} />
{/if}
