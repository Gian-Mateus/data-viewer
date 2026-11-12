<script setup lang="ts">
import type { Component } from 'vue';
import { Label } from './ui/label';
import FilterCheckbox from './filters/FilterCheckbox.vue';
import FilterDateRange from './filters/FilterDateRange.vue';
import FilterRadio from './filters/FilterRadio.vue';
import FilterSelect from './filters/FilterSelect.vue';
import FilterToggle from './filters/FilterToggle.vue';
import type { Filter, FilterValues } from './types';

defineProps<{
  filters: Filter[];
}>();

const modelValue = defineModel<FilterValues>({ required: true });

const components: Record<Filter['type'], Component> = {
  'select': FilterSelect,
  'checkbox': FilterCheckbox,
  'radio': FilterRadio,
  'toggle': FilterToggle,
  'date-range': FilterDateRange,
};
</script>

<template>
  <div
    v-for="filter in filters"
    :key="filter.key"
    class="flex flex-col gap-1.5"
    :class="$attrs.class"
  >
    <Label class="text-xs font-medium text-muted-foreground">{{ filter.label }}</Label>
    <component
      :is="components[filter.type]"
      v-model="modelValue[filter.key]"
      :filter="filter"
    />
  </div>
</template>
