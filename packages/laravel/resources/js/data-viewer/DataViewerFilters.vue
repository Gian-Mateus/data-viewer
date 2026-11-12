<script setup lang="ts">
import { SlidersHorizontal } from '@lucide/vue';
import { computed, ref, watch } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import DataViewerFilterFields from './DataViewerFilterFields.vue';
import { clone, isActive } from './query';
import type { Filter, FilterValues } from './types';
import { useLabels } from './config';

const labels = useLabels();

const props = withDefaults(
  defineProps<{
    filters: Filter[];
    type?: 'inline' | 'dropdown' | 'modal';
    applied: FilterValues;
  }>(),
  {
    type: 'dropdown',
  },
);

const emit = defineEmits<{
  apply: [values: FilterValues];
}>();

const open = ref(false);
const draft = ref<FilterValues>(clone(props.applied));

watch(
  () => props.applied,
  (applied) => {
    draft.value = clone(applied);
  },
  { deep: true, immediate: true },
);

watch(open, (isOpen) => {
  if (isOpen) {
    draft.value = clone(props.applied);
  }
});

const activeCount = computed(() => Object.values(props.applied).filter(isActive).length);

function apply() {
  emit('apply', clone(draft.value));
  open.value = false;
}

function clearAll() {
  draft.value = {};
  apply();
}
</script>

<template>
  <!-- Modo INLINE: Exibido diretamente na barra/área com grid fluido e responsivo -->
  <div
    v-if="type === 'inline'"
    class="flex w-full flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/30 p-3"
  >
    <div class="flex flex-1 flex-wrap items-center gap-3">
      <DataViewerFilterFields
        v-model="draft"
        :filters="filters"
        class="min-w-44 flex-1"
      />
    </div>

    <div class="flex items-center gap-1.5 pb-0.5">
      <Button
        v-if="activeCount > 0"
        variant="ghost"
        size="sm"
        @click="clearAll"
      >
        {{ labels.clear }}
      </Button>
      <Button
        size="sm"
        @click="apply"
      >
        {{ labels.apply }}
      </Button>
    </div>
  </div>

  <!-- Modo DROPDOWN: Popover compacto suspenso -->
  <Popover
    v-else-if="type === 'dropdown'"
    v-model:open="open"
  >
    <PopoverTrigger as-child>
      <Button variant="outline">
        <SlidersHorizontal class="size-4" />
        {{ labels.filters }}
        <Badge
          v-if="activeCount"
          variant="secondary"
          class="ml-1 px-1.5 py-0 text-xs"
        >
          {{ activeCount }}
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      class="w-80 p-4"
    >
      <div class="flex max-h-80 flex-col gap-4 overflow-y-auto pr-1">
        <DataViewerFilterFields
          v-model="draft"
          :filters="filters"
        />
      </div>

      <Separator class="my-3" />

      <div class="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          :disabled="!activeCount && Object.keys(draft).length === 0"
          @click="clearAll"
        >
          {{ labels.clear }}
        </Button>
        <Button
          size="sm"
          @click="apply"
        >
          {{ labels.apply }}
        </Button>
      </div>
    </PopoverContent>
  </Popover>

  <!-- Modo MODAL: Diálogo centralizado com scroll e footer bem estruturado -->
  <Dialog
    v-else-if="type === 'modal'"
    v-model:open="open"
  >
    <DialogTrigger as-child>
      <Button variant="outline">
        <SlidersHorizontal class="size-4" />
        {{ labels.filters }}
        <Badge
          v-if="activeCount"
          variant="secondary"
          class="ml-1 px-1.5 py-0 text-xs"
        >
          {{ activeCount }}
        </Badge>
      </Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ labels.filterTitle }}</DialogTitle>
        <DialogDescription>
          {{ labels.filterDescription }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto py-2 pr-1 sm:grid-cols-2">
        <DataViewerFilterFields
          v-model="draft"
          :filters="filters"
        />
      </div>

      <DialogFooter class="flex flex-row items-center justify-between gap-2 border-t pt-3 sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          :disabled="!activeCount && Object.keys(draft).length === 0"
          @click="clearAll"
        >
          {{ labels.clearAll }}
        </Button>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="open = false"
          >
            {{ labels.cancel }}
          </Button>
          <Button
            size="sm"
            @click="apply"
          >
            {{ labels.applyFilters }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
