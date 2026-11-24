<script lang="ts">
  import type { ComboAsset } from '../context.ts';
  import { displayed } from '../displayed.svelte.ts';

  interface Props {
    asset: ComboAsset;
  }

  let { asset }: Props = $props();

  $effect(() => {
    displayed.asset = { id: asset.id, visibility: asset.visibility, isTrashed: asset.isTrashed };
    return () => {
      displayed.asset = undefined;
    };
  });
</script>
