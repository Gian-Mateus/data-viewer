<script setup lang="ts">
import { Checkbox } from '../ui/checkbox';
import type { CheckboxFilter } from '../types';

defineProps<{ filter: CheckboxFilter }>();

const model = defineModel<string[]>({ default: () => [] });

function toggle(value: string, checked: boolean) {
  model.value = checked
    ? [...model.value, value]
    : model.value.filter((item) => item !== value);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label
      v-for="option in filter.options"
      :key="option.value"
      class="flex items-center gap-2 text-sm"
    >
      <Checkbox
        :model-value="model.includes(String(option.value))"
        @update:model-value="(checked) => toggle(String(option.value), checked === true)"
      />
      {{ option.label }}
    </label>
  </div>
</template>
