<script setup lang="ts">
import { ArrowDown, ArrowUp, ArrowUpDown } from '@lucide/vue';

defineProps<{
  label: string;
  direction: 'asc' | 'desc' | null;
}>();
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 text-xs font-medium uppercase transition-colors hover:cursor-pointer hover:text-foreground"
  >
    {{ label }}
    <ArrowUp
      v-if="direction === 'asc'"
      class="size-3.5 text-primary"
    />
    <ArrowDown
      v-else-if="direction === 'desc'"
      class="size-3.5 text-primary"
    />
    <ArrowUpDown
      v-else
      class="size-3.5 opacity-50"
    />
  </button>
</template>
