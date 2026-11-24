<script lang="ts">
  import { Icon } from '@immich/ui';
  import { mdiStarFourPoints } from '@mdi/js';
  import { t } from 'svelte-i18n';
</script>

<span
  class="inline-flex items-center gap-1 rounded-sm border border-amber-400/60 bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-amber-700 uppercase dark:text-amber-300"
  data-fork="chip"
>
  <Icon icon={mdiStarFourPoints} size="11" />
  {$t('fork_mark')}
</span>
