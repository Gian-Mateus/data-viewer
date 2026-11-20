<script setup lang="ts">
import { Columns3, LayoutGrid, Search, Table2 } from '@lucide/vue';
import { computed, ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import DataViewerFilters from './DataViewerFilters.vue';
import type { DataViewerConfig, FilterValues, Query, ViewMode } from './types';
import { useLabels } from './config';

const labels = useLabels();

const props = defineProps<{
  config: DataViewerConfig;
  query: Query;
}>();

const emit = defineEmits<{
  search: [value: string];
  applyFilters: [values: FilterValues];
}>();

const viewMode = defineModel<ViewMode>('viewMode', { required: true });
const hiddenColumns = defineModel<string[]>('hiddenColumns', { required: true });

// Rascunho da pesquisa: só dispara no Enter.
const search = ref(props.query.search);
watch(() => props.query.search, (value) => (search.value = value));

const hideableColumns = computed(() => props.config.columns.filter((column) => column.hideable));

function toggleColumn(key: string) {
  hiddenColumns.value = hiddenColumns.value.includes(key)
    ? hiddenColumns.value.filter((item) => item !== key)
    : [...hiddenColumns.value, key];
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Barra Principal (padrão Filament): View Mode à esquerda | Ações, Colunas, Pesquisa à direita -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <!-- Lado Esquerdo: Alternador Tabela / Cards -->
      <div class="flex items-center gap-2">
        <div class="relative inline-flex items-center rounded-lg border border-border bg-muted/60 p-1 text-muted-foreground shadow-xs">
          <div
            class="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md bg-background shadow-xs transition-transform duration-200 ease-in-out"
            :class="viewMode === 'table' ? 'translate-x-0' : 'translate-x-full'"
          />
          <button
            type="button"
            class="relative z-10 inline-flex w-24 items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors select-none"
            :class="viewMode === 'table' ? 'font-semibold text-foreground' : 'hover:text-foreground'"
            @click="viewMode = 'table'"
          >
            <Table2 class="size-3.5" />
            {{ labels.table }}
          </button>
          <button
            type="button"
            class="relative z-10 inline-flex w-24 items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors select-none"
            :class="viewMode === 'grid' ? 'font-semibold text-foreground' : 'hover:text-foreground'"
            @click="viewMode = 'grid'"
          >
            <LayoutGrid class="size-3.5" />
            {{ labels.cards }}
          </button>
        </div>
      </div>

      <!-- Lado Direito: Pesquisa, Filtros (quando dropdown/modal) e Controle de Colunas -->
      <div class="flex items-center gap-2 ml-auto">
        <!-- Input de Pesquisa -->
        <InputGroup
          v-if="config.searchable"
          class="w-64 sm:w-72"
        >
          <InputGroupInput
            v-model="search"
            :placeholder="labels.searchPlaceholder"
            @keydown.enter="emit('search', search)"
          />
          <InputGroupAddon>
            <Search class="size-4" />
          </InputGroupAddon>
        </InputGroup>

        <!-- Botão de Filtros (dropdown ou modal) -->
        <DataViewerFilters
          v-if="config.filters.length && config.filterDisplay !== 'inline'"
          :filters="config.filters"
          :type="config.filterDisplay ?? 'dropdown'"
          :applied="query.filter"
          @apply="(values) => emit('applyFilters', values)"
        />

        <!-- Menu de Ocultação de Colunas (apenas se houver colunas configuradas como hideable) -->
        <DropdownMenu v-if="hideableColumns.length">
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              <Columns3 class="size-4" />
              {{ labels.columns }}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              v-for="column in hideableColumns"
              :key="column.key"
              :model-value="!hiddenColumns.includes(column.key)"
              @update:model-value="toggleColumn(column.key)"
              @select.prevent
            >
              {{ column.label }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Área de Filtros Inline (quando filterDisplay === 'inline') -->
    <div
      v-if="config.filters.length && config.filterDisplay === 'inline'"
      class="w-full"
    >
      <DataViewerFilters
        :filters="config.filters"
        type="inline"
        :applied="query.filter"
        @apply="(values) => emit('applyFilters', values)"
      />
    </div>
  </div>
</template>
