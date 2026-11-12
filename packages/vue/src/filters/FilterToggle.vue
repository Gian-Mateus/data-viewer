<script setup lang="ts">
import { Switch } from '../ui/switch';
import type { ToggleFilter } from '../types';

defineProps<{ filter: ToggleFilter }>();

const model = defineModel<boolean>({ default: false });
</script>

<template>
  <label class="flex items-center gap-2 text-sm">
    <Switch v-model="model" />
    {{ model ? 'Sim' : 'Não' }}
  </label>
</template>
