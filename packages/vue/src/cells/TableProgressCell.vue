<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';
import { cn } from '../lib/utils';

export interface TableProgressCellProps {
  value?: number | null;
  showLabel?: boolean;
  colorClass?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<TableProgressCellProps>(), {
  value: 0,
  showLabel: true,
  colorClass: 'bg-primary',
  class: undefined,
});

const clampedValue = computed<number>(() => {
  if (props.value === null || props.value === undefined || isNaN(props.value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(props.value)));
});
</script>

<template>
  <div :class="cn('flex items-center gap-2.5 min-w-20 max-w-full', props.class)">
    <!-- Barra de Progresso -->
    <div
      class="relative h-2 w-full overflow-hidden rounded-full bg-muted dark:bg-muted/60"
      role="progressbar"
      :aria-valuenow="clampedValue"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        :class="cn('h-full rounded-full transition-all duration-300', colorClass)"
        :style="{ width: `${clampedValue}%` }"
      />
    </div>

    <!-- Rótulo de porcentagem -->
    <span
      v-if="showLabel"
      class="text-xs font-medium text-muted-foreground tabular-nums shrink-0"
    >
      {{ clampedValue }}%
    </span>
  </div>
</template>
