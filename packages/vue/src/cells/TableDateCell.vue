<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';
import { cn } from '../lib/utils';
import { useDataViewerContext } from '../config';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export type TableDateFormat = 'date' | 'datetime' | 'relative' | 'time';

export interface TableDateCellProps {
  value?: string | Date | null;
  format?: TableDateFormat;
  showRelativeTooltip?: boolean;
  class?: HTMLAttributes['class'];
}

const locale = useDataViewerContext().locale;

const props = withDefaults(defineProps<TableDateCellProps>(), {
  value: undefined,
  format: 'date',
  showRelativeTooltip: false,
  class: undefined,
});

const parsedDate = computed<Date | null>(() => {
  if (!props.value) return null;
  if (props.value instanceof Date) {
    return isNaN(props.value.getTime()) ? null : props.value;
  }
  if (typeof props.value === 'string') {
    const trimmed = props.value.trim();
    if (!trimmed) return null;

    // Caso YYYY-MM-DD puro (evita timezone shift)
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      return new Date(y, m - 1, d);
    }

    // Normaliza 'YYYY-MM-DD HH:mm:ss' para formato ISO
    const normalized = trimmed.includes(' ') && !trimmed.includes('T')
      ? trimmed.replace(' ', 'T')
      : trimmed;

    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
});

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const absSeconds = Math.abs(diffInSeconds);
  if (absSeconds < 45) {
    return locale.startsWith('pt') ? 'agora' : 'now';
  }
  const diffInMinutes = Math.round(diffInSeconds / 60);
  const absMinutes = Math.abs(diffInMinutes);
  if (absMinutes < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }
  const diffInHours = Math.round(diffInMinutes / 60);
  const absHours = Math.abs(diffInHours);
  if (absHours < 24) {
    return rtf.format(diffInHours, 'hour');
  }
  const diffInDays = Math.round(diffInHours / 24);
  const absDays = Math.abs(diffInDays);
  if (absDays < 30) {
    return rtf.format(diffInDays, 'day');
  }
  const diffInMonths = Math.round(diffInDays / 30);
  const absMonths = Math.abs(diffInMonths);
  if (absMonths < 12) {
    return rtf.format(diffInMonths, 'month');
  }
  const diffInYears = Math.round(diffInDays / 365);
  return rtf.format(diffInYears, 'year');
};

const formattedValue = computed<string>(() => {
  if (!parsedDate.value) return '-';

  const date = parsedDate.value;

  switch (props.format) {
    case 'datetime':
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);

    case 'time':
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);

    case 'relative':
      return formatRelativeTime(date);

    case 'date':
    default:
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
  }
});

const tooltipText = computed<string | null>(() => {
  if (!parsedDate.value || !props.showRelativeTooltip) return null;

  const date = parsedDate.value;

  if (props.format === 'relative') {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  // Se format='date', 'datetime' ou 'time', mostra o relativo no tooltip
  return formatRelativeTime(date);
});
</script>

<template>
  <div :class="cn('inline-flex items-center text-sm tabular-nums whitespace-nowrap', props.class)">
    <TooltipProvider
      v-if="tooltipText"
      :delay-duration="200"
    >
      <Tooltip>
        <TooltipTrigger as-child>
          <span
            :class="cn(
              parsedDate ? 'cursor-help decoration-muted-foreground/40 underline-offset-4 hover:underline' : 'text-muted-foreground'
            )"
          >
            {{ formattedValue }}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{{ tooltipText }}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <span
      v-else
      :class="cn(!parsedDate && 'text-muted-foreground')"
    >
      {{ formattedValue }}
    </span>
  </div>
</template>
