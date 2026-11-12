<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue';
import { Checkbox } from './ui/checkbox';
import { useResizableColumns } from './useResizableColumns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import DataViewerSortButton from './DataViewerSortButton.vue';
import { sortDirection } from './query';
import type { Column } from './types';
import { navigateRow } from './useDataViewer';
import type { NavigateFn } from './useDataViewer';
import { useLabels } from './config';
import type { Selection } from './useSelection';

const props = withDefaults(
  defineProps<{
    columns: Column[];
    rows: T[];
    rowKey: string;
    sort: string | null;
    selection: Selection | null;
    recordUrlKey?: string;
    storageKey?: string;
    resizable?: boolean;
    navigate?: NavigateFn;
  }>(),
  {
    recordUrlKey: 'url',
    storageKey: 'data-viewer',
    resizable: true,
    navigate: undefined,
  },
);

const emit = defineEmits<{
  (e: 'sort', key: string): void;
}>();

const labels = useLabels();

const keyOf = (row: T) => String(row[props.rowKey]);
const pageKeys = computed(() => props.rows.map(keyOf));


const resizableColumns = useResizableColumns(props.storageKey ?? 'data-viewer');

const tableClass = computed(() => (props.resizable && resizableColumns.hasSavedWidths.value ? 'table-fixed' : ''));

function colStyle(key: string) {
  return props.resizable ? resizableColumns.colStyle(key) : undefined;
}

function startResize(event: MouseEvent, key: string) {
  if (props.resizable) {
    resizableColumns.startResize(event, key);
  }
}

function resetColumn(key: string) {
  if (props.resizable) {
    resizableColumns.resetColumn(key);
  }
}
</script>

<template>
  <Table :class="tableClass">
    <colgroup v-if="resizable">
      <col
        v-if="selection"
        style="width: 2.5rem"
      >
      <col
        v-for="column in columns"
        :key="column.key"
        :style="colStyle(column.key)"
      >
    </colgroup>
    <TableHeader>
      <TableRow class="bg-muted">
        <TableHead
          v-if="selection"
          class="w-10"
        >
          <Checkbox
            :model-value="selection.pageState(pageKeys)"
            @update:model-value="(checked) => selection?.setMany(pageKeys, checked === true)"
          />
        </TableHead>
        <TableHead
          v-for="column in columns"
          :key="column.key"
          class="relative"
        >
          <button
            v-if="resizable"
            type="button"
            class="absolute right-0 top-0 bottom-0 z-10 w-2 cursor-col-resize opacity-0 transition-opacity hover:bg-border/70 hover:opacity-100"
            :aria-label="labels.resizeColumn"
            @mousedown="startResize($event, column.key)"
            @dblclick.stop="resetColumn(column.key)"
          />
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
        </TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow
        v-for="row in rows"
        :key="keyOf(row)"
        :data-state="selection?.isSelected(keyOf(row)) ? 'selected' : undefined"
        class="even:bg-muted/30 hover:bg-muted/70 transition-colors"
        :class="{ 'hover:bg-muted/70 hover:cursor-pointer transition-colors': Boolean(row[recordUrlKey]) }"
        @click="(e: MouseEvent) => navigateRow(e, row, recordUrlKey, navigate)"
      >
        <TableCell
          v-if="selection"
          @click.stop
        >
          <Checkbox
            :model-value="selection.isSelected(keyOf(row))"
            @update:model-value="selection?.toggle(keyOf(row))"
          />
        </TableCell>
        <TableCell
          v-for="column in columns"
          :key="column.key"
          class="max-w-3xs whitespace-normal"
        >
          <slot
            :name="column.key"
            :item="row"
            :row="row"
            :value="row[column.key]"
          >
            {{ row[column.key] }}
          </slot>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
