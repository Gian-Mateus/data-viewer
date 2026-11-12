<script setup lang="ts">
import { computed } from 'vue';
import { X } from '@lucide/vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isActive } from './query';
import type { Filter, FilterValues } from './types';
import { useLabels } from './config';

const labels = useLabels();

const props = defineProps<{
  filters: Filter[];
  applied: FilterValues;
}>();

const emit = defineEmits<{
  remove: [key: string];
  clearAll: [];
}>();

interface ActiveTag {
  key: string;
  label: string;
  displayValue: string;
}

const activeTags = computed<ActiveTag[]>(() => {
  const tags: ActiveTag[] = [];

  for (const filter of props.filters) {
    const value = props.applied[filter.key];
    if (!isActive(value)) continue;

    let displayValue = '';

    if (filter.type === 'toggle') {
      displayValue = 'Sim';
    } else if (filter.type === 'select') {
      if (Array.isArray(value)) {
        displayValue = value
          .map((v) => filter.options?.find((o) => o.value === v)?.label ?? v)
          .join(', ');
      } else {
        displayValue = filter.options?.find((o) => o.value === value)?.label ?? String(value);
      }
    } else if (filter.type === 'checkbox') {
      const arr = Array.isArray(value) ? value : [value];
      displayValue = arr
        .map((v) => filter.options?.find((o) => o.value === v)?.label ?? v)
        .join(', ');
    } else if (filter.type === 'radio') {
      displayValue = filter.options?.find((o) => o.value === value)?.label ?? String(value);
    } else if (filter.type === 'date-range') {
      const range = value as { from?: string; to?: string };
      if (range.from && range.to) {
        displayValue = labels.dateRange(range.from, range.to);
      } else if (range.from) {
        displayValue = labels.fromDate(range.from);
      }
    } else {
      displayValue = String(value);
    }

    tags.push({
      key: filter.key,
      label: filter.label,
      displayValue,
    });
  }

  return tags;
});
</script>

<template>
  <div
    v-if="activeTags.length > 0"
    class="flex flex-wrap items-center gap-2 text-xs"
  >
    <span class="text-muted-foreground font-medium">{{ labels.activeFilters }}</span>

    <Badge
      v-for="tag in activeTags"
      :key="tag.key"
      variant="secondary"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal"
    >
      <span class="font-medium text-foreground">{{ tag.label }}:</span>
      <span>{{ tag.displayValue }}</span>
      <button
        type="button"
        class="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground hover:cursor-pointer transition-colors"
        :aria-label="labels.removeFilter(tag.label)"
        @click="emit('remove', tag.key)"
      >
        <X class="size-3" />
      </button>
    </Badge>

    <Button
      variant="ghost"
      size="xs"
      class="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      @click="emit('clearAll')"
    >
      {{ labels.clearAll }}
    </Button>
  </div>
</template>
