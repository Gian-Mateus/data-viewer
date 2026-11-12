<script setup lang="ts">
import { ref, watch } from 'vue';
import { Calendar as CalendarIcon, X } from '@lucide/vue';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { RangeCalendar } from '../ui/range-calendar';
import type { DateRangeFilter } from '../types';
import { useLabels } from '../config';

const labels = useLabels();

defineProps<{ filter: DateRangeFilter }>();

const model = defineModel<{ from: string; to: string } | null>();

// Reka UI expõe DateValue em módulos distintos; o v-model conflita entre as declarações.
const range = ref<any>({ start: undefined, end: undefined });

watch(range, (val) => {
  if (val.start) {
    model.value = {
      from: val.start.toString(),
      to: (val.end ?? val.start).toString(),
    };
  } else {
    model.value = null;
  }
});

function clear(e: Event) {
  e.stopPropagation();
  range.value = { start: undefined, end: undefined };
  model.value = null;
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        class="w-full justify-between font-normal"
        :class="{ 'text-muted-foreground': !model?.from }"
      >
        <span class="flex items-center gap-2">
          <CalendarIcon class="size-4" />
          <template v-if="model?.from && model?.to">
            {{ labels.dateRange(model.from, model.to) }}
          </template>
          <template v-else-if="model?.from">
            {{ labels.fromDate(model.from) }}
          </template>
          <template v-else>
            {{ labels.selectPeriod }}
          </template>
        </span>
        <X
          v-if="model?.from"
          class="size-3.5 hover:text-foreground hover:cursor-pointer"
          @click="clear"
        />
      </Button>
    </PopoverTrigger>

    <PopoverContent
      class="w-auto p-0"
      align="start"
    >
      <RangeCalendar v-model="range" />
    </PopoverContent>
  </Popover>
</template>
