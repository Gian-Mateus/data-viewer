<script setup lang="ts">
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'reka-ui';
import type { RadioFilter } from '../types';

defineProps<{ filter: RadioFilter }>();

const model = defineModel<string | null>();
</script>

<template>
  <RadioGroupRoot
    v-model="model"
    class="flex flex-col gap-2"
  >
    <label
      v-for="option in filter.options"
      :key="option.value"
      class="flex items-center gap-2 text-sm"
    >
      <RadioGroupItem
        :value="String(option.value)"
        class="flex size-4 items-center justify-center rounded-full border border-input shadow-xs data-[state=checked]:border-primary"
      >
        <RadioGroupIndicator class="size-2 rounded-full bg-primary" />
      </RadioGroupItem>
      {{ option.label }}
    </label>
  </RadioGroupRoot>
</template>
