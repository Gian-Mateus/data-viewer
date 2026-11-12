<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../lib/utils';

export type TableActionsAlign = 'left' | 'center' | 'right';

export interface TableActionsCellProps {
  align?: TableActionsAlign;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<TableActionsCellProps>(), {
  align: 'right',
  class: undefined,
});

const alignMap: Record<TableActionsAlign, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};
</script>

<template>
  <div
    data-slot="table-actions-cell"
    :class="cn(
      'flex items-center gap-1.5 whitespace-nowrap',
      alignMap[props.align],
      props.class,
    )"
  >
    <slot />
  </div>
</template>
