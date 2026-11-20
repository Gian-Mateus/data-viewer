<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SelectFilter } from '../types';
import { useLabels } from '../config';

const labels = useLabels();

defineProps<{ filter: SelectFilter }>();

const model = defineModel<string | string[] | null>();
</script>

<template>
  <Select
    v-model="model"
    :multiple="filter.multiple"
  >
    <SelectTrigger class="w-full">
      <SelectValue :placeholder="labels.allOption" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="option in filter.options"
        :key="option.value"
        :value="String(option.value)"
      >
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
