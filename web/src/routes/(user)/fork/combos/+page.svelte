<script lang="ts">
  import UserPageLayout from '#lib/components/layouts/UserPageLayout.svelte';
  import ComboList from '#lib/fork/ui/ComboList.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<UserPageLayout title={data.meta.title}>
  <div class="mx-auto w-full max-w-3xl p-4">
    <ComboList />
  </div>
</UserPageLayout>
