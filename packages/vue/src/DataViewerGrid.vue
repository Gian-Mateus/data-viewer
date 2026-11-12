<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from 'vue';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import DataViewerSortButton from './DataViewerSortButton.vue';
import { sortDirection } from './query';
import type { Column } from './types';
import { navigateRow } from './useDataViewer';
import type { NavigateFn } from './useDataViewer';
import type { Selection } from './useSelection';

const props = withDefaults(
  defineProps<{
    columns: Column[];
    rows: T[];
    rowKey: string;
    sort: string | null;
    selection: Selection | null;
    recordUrlKey?: string;
    navigate?: NavigateFn;
  }>(),
  {
    recordUrlKey: 'url',
    navigate: undefined,
  },
);

const emit = defineEmits<{
  sort: [key: string];
}>();

const keyOf = (row: T) => String(row[props.rowKey]);
const pageKeys = computed(() => props.rows.map(keyOf));

const titleColumn = computed(() => props.columns[0]);
const bodyColumns = computed(() => props.columns.slice(1));
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Cabeçalho do grid: mesmo visual e comportamento do cabeçalho da tabela -->
    <div
      v-if="selection || columns.some((c) => c.sortable)"
      class="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-1 border-b bg-muted px-2 py-1"
    >
      <Checkbox
        v-if="selection"
        :model-value="selection.pageState(pageKeys)"
        @update:model-value="(checked) => selection?.setMany(pageKeys, checked === true)"
      />

      <template
        v-for="column in columns"
        :key="column.key"
      >
        <DataViewerSortButton
          v-if="column.sortable"
          :label="column.label"
          :direction="sortDirection(sort, column.key)"
          @click="emit('sort', column.key)"
        />
        <span
          v-else
          class="text-xs font-medium uppercase"
        >
          {{ column.label }}
        </span>
      </template>
    </div>

    <!-- Grid de cards -->
    <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      <Card
        v-for="row in rows"
        :key="keyOf(row)"
        class="relative transition-all"
        :class="{
          'pt-5 gap-3': Boolean(selection),
          'ring-2 ring-primary': selection?.isSelected(keyOf(row)),
          'hover:shadow-md hover:cursor-pointer': Boolean(row[recordUrlKey]),
        }"
        @click="(e: MouseEvent) => navigateRow(e, row, recordUrlKey, navigate)"
      >
        <!-- Checkbox no topo do card -->
        <div
          v-if="selection"
          class="flex items-center px-6"
        >
          <Checkbox
            :model-value="selection.isSelected(keyOf(row))"
            @click.stop
            @update:model-value="selection?.toggle(keyOf(row))"
          />
        </div>

        <!-- Corpo do card -->
        <div class="flex flex-1 flex-col gap-6">
          <slot
            name="card"
            :item="row"
            :row="row"
            :selection="selection"
            :is-selected="selection?.isSelected(keyOf(row))"
          >
            <CardHeader v-if="titleColumn">
              <slot
                name="card-header"
                :item="row"
                :row="row"
              >
                <CardTitle>
                  <slot
                    :name="titleColumn.key"
                    :item="row"
                    :row="row"
                    :value="row[titleColumn.key]"
                  >
                    {{ row[titleColumn.key] }}
                  </slot>
                </CardTitle>
              </slot>
            </CardHeader>

            <CardContent class="flex flex-col gap-2 text-sm">
              <slot
                name="card-content"
                :item="row"
                :row="row"
              >
                <div
                  v-for="column in bodyColumns"
                  :key="column.key"
                >
                  <span class="font-medium text-muted-foreground">{{ column.label }}: </span>
                  <slot
                    :name="column.key"
                    :item="row"
                    :row="row"
                    :value="row[column.key]"
                  >
                    {{ row[column.key] }}
                  </slot>
                </div>
              </slot>
            </CardContent>

            <CardFooter
              v-if="$slots['card-footer']"
              class="pt-2"
            >
              <slot
                name="card-footer"
                :item="row"
                :row="row"
              />
            </CardFooter>
          </slot>
        </div>
      </Card>
    </div>
  </div>
</template>
