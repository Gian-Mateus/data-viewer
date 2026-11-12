<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue';
import { computed } from 'vue';
import { Check, X } from '@lucide/vue';
import { cn } from '@/lib/utils';

export interface TableIconCellProps {
  value?: boolean | string | number | null;
  trueIcon?: Component | object | string;
  falseIcon?: Component | object | string;
  trueColor?: string;
  falseColor?: string;
  icon?: Component | object | string;
  color?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<TableIconCellProps>(), {
  value: undefined,
  trueIcon: () => Check,
  falseIcon: () => X,
  trueColor: 'text-emerald-500 dark:text-emerald-400',
  falseColor: 'text-rose-500 dark:text-rose-400',
  icon: undefined,
  color: undefined,
  class: undefined,
});

const isExplicitIcon = computed(() => props.icon !== undefined);

const isTruthy = computed(() => {
  return (
    props.value === true ||
    props.value === 1 ||
    props.value === '1' ||
    props.value === 'true'
  );
});

const isFalsy = computed(() => {
  return (
    props.value === false ||
    props.value === 0 ||
    props.value === '0' ||
    props.value === 'false'
  );
});

const resolvedIcon = computed(() => {
  if (isExplicitIcon.value) {
    return props.icon;
  }
  if (isTruthy.value) {
    return props.trueIcon;
  }
  if (isFalsy.value) {
    return props.falseIcon;
  }
  return undefined;
});

const resolvedColor = computed(() => {
  if (isExplicitIcon.value) {
    return props.color ?? 'text-muted-foreground';
  }
  if (isTruthy.value) {
    return props.trueColor;
  }
  if (isFalsy.value) {
    return props.falseColor;
  }
  return 'text-muted-foreground';
});
</script>

<template>
  <div :class="cn('inline-flex items-center justify-center shrink-0', props.class)">
    <component
      :is="resolvedIcon"
      v-if="resolvedIcon"
      :class="cn('size-4.5 shrink-0', resolvedColor)"
    />
    <span
      v-else
      class="text-sm text-muted-foreground"
    >
      -
    </span>
  </div>
</template>
