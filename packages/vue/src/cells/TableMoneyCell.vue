<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';
import { cn } from '../lib/utils';

export interface TableMoneyCellProps {
  value?: number | string | null;
  currency?: string;
  inCents?: boolean;
  locale?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<TableMoneyCellProps>(), {
  value: undefined,
  currency: 'BRL',
  inCents: false,
  locale: 'pt-BR',
  class: undefined,
});

const numericValue = computed<number | null>(() => {
  if (props.value === null || props.value === undefined || props.value === '') {
    return null;
  }

  let num: number;

  if (typeof props.value === 'number') {
    num = props.value;
  } else {
    let str = String(props.value).trim();
    // Trata formato brasileiro '1.234,56' ou '1234,56'
    if (str.includes(',') && str.includes('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else if (str.includes(',')) {
      str = str.replace(',', '.');
    }
    num = Number(str);
  }

  if (isNaN(num)) return null;

  return props.inCents ? num / 100 : num;
});

const formattedValue = computed<string>(() => {
  if (numericValue.value === null) return '-';

  try {
    return new Intl.NumberFormat(props.locale, {
      style: 'currency',
      currency: props.currency,
    }).format(numericValue.value);
  } catch {
    return numericValue.value.toFixed(2);
  }
});
</script>

<template>
  <div :class="cn('inline-flex items-center text-sm tabular-nums font-medium whitespace-nowrap', props.class)">
    <span :class="cn(numericValue === null && 'text-muted-foreground font-normal')">
      {{ formattedValue }}
    </span>
  </div>
</template>
