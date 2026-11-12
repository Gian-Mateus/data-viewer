<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';
import { Badge, type BadgeVariants } from '../ui/badge';
import { cn } from '../lib/utils';

export type TableBadgeVariant = NonNullable<BadgeVariants['variant']>;

export interface TableBadgeMapItem {
  label?: string;
  variant?: TableBadgeVariant;
  colorClass?: string;
  dot?: boolean;
}

export type TableBadgeMap = Record<string | number, TableBadgeMapItem>;

export interface TableBadgeCellProps {
  value?: any;
  label?: string;
  variant?: TableBadgeVariant;
  map?: TableBadgeMap;
  dot?: boolean;
  pulse?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<TableBadgeCellProps>(), {
  value: undefined,
  label: undefined,
  variant: undefined,
  map: undefined,
  dot: false,
  pulse: false,
  class: undefined,
});

const mapConfig = computed<TableBadgeMapItem | undefined>(() => {
  if (!props.map || props.value === null || props.value === undefined) {
    return undefined;
  }
  const key = String(props.value);
  return props.map[key] ?? (typeof props.value === 'number' ? props.map[props.value] : undefined);
});

const resolvedLabel = computed<string>(() => {
  if (props.label !== undefined && props.label !== null) {
    return props.label;
  }
  if (mapConfig.value?.label !== undefined) {
    return mapConfig.value.label;
  }
  if (props.value !== null && props.value !== undefined && props.value !== '') {
    return String(props.value);
  }
  return '-';
});

const resolvedVariant = computed<TableBadgeVariant>(() => {
  return mapConfig.value?.variant ?? props.variant ?? 'secondary';
});

const resolvedColorClass = computed<string>(() => {
  return mapConfig.value?.colorClass ?? '';
});

const resolvedDot = computed<boolean>(() => {
  return mapConfig.value?.dot ?? props.dot ?? false;
});

const resolvedPulse = computed<boolean>(() => {
  return props.pulse ?? false;
});
</script>

<template>
  <div :class="cn('inline-flex items-center max-w-full', props.class)">
    <Badge
      :variant="resolvedVariant"
      :class="cn('truncate font-medium transition-colors gap-1.5', resolvedColorClass)"
    >
      <!-- Ponto indicador (dot) -->
      <span
        v-if="resolvedDot"
        class="relative flex size-2 shrink-0 items-center justify-center -ml-0.5"
      >
        <span
          v-if="resolvedPulse"
          class="absolute inline-flex size-full animate-ping rounded-full opacity-75 bg-current"
        />
        <span class="relative inline-flex size-1.5 rounded-full bg-current" />
      </span>

      <span class="truncate">
        <slot>{{ resolvedLabel }}</slot>
      </span>
    </Badge>
  </div>
</template>
