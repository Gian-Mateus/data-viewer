<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, provide, useSlots } from 'vue';
import { useStorage } from '@vueuse/core';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import DataViewerActiveFilters from './DataViewerActiveFilters.vue';
import DataViewerFooter from './DataViewerFooter.vue';
import DataViewerGrid from './DataViewerGrid.vue';
import DataViewerTable from './DataViewerTable.vue';
import DataViewerToolbar from './DataViewerToolbar.vue';
import {
    DATA_VIEWER_CONTEXT,
    mergeLabels,
    useGlobalConfig,
} from './config';
import type { DataViewerLabels } from './config';
import { clone, parseQuery } from './query';
import type { DataViewerConfig, FilterValues, Paginated, ViewMode } from './types';
import type { DataViewerProvider } from './providers/types';
import { useDataViewer } from './useDataViewer';
import type { NavigateFn } from './useDataViewer';
import { useSelection } from './useSelection';

const props = withDefaults(
    defineProps<{
        config: DataViewerConfig;
        data: Paginated<T>;
        url?: string;
        storageKey?: string;
        defaultViewMode?: ViewMode;
        only?: string[];
        /** Provider de dados. Padrão: o configurado no plugin ou `fetch`. */
        provider?: DataViewerProvider<T>;
        /** Sobrescreve a navegação ao clicar em uma linha/card. */
        navigate?: NavigateFn;
        /** Textos da interface. Mesclado com o padrão PT-BR e o configurado no plugin. */
        labels?: Partial<DataViewerLabels>;
    }>(),
    {
        storageKey: undefined,
        defaultViewMode: undefined,
        only: undefined,
        url: undefined,
        provider: undefined,
        navigate: undefined,
        labels: undefined,
    },
);

const global = useGlobalConfig();

const resolvedLabels = mergeLabels(global.labels, props.labels);
const resolvedStorageKey = computed(
    () => props.config.storageKey ?? props.storageKey ?? global.storageKey ?? 'data-viewer',
);
const resolvedViewMode = computed(() => props.defaultViewMode ?? global.defaultViewMode ?? 'table');
const resolvedPerPageOptions = computed(
    () => props.config.perPageOptions ?? global.perPageOptions ?? [15, 30, 50, 100],
);

provide(DATA_VIEWER_CONTEXT, {
    ...global,
    provider: props.provider ?? global.provider,
    labels: resolvedLabels,
    locale: global.locale ?? 'pt-BR',
});

const requestUrl =
    props.url ?? (typeof window !== 'undefined' ? window.location.pathname : '');
const initialQuery = parseQuery(
    typeof window !== 'undefined' ? window.location.href : '',
    props.config.filters,
);

const viewer = useDataViewer<T>({
    url: requestUrl,
    source: () => props.data,
    initialQuery,
    only: props.only,
    provider: props.provider ?? global.provider,
    navigate: props.navigate,
});

const slots = useSlots();

const isSelectable = computed(() => Boolean(slots['bulk-actions']));

const selection = isSelectable.value
    ? useSelection(() => viewer.pagination.value.total)
    : null;

const viewModeState = useStorage<ViewMode>(
    `${resolvedStorageKey.value}:view-mode`,
    resolvedViewMode.value,
);
const hiddenColumnsState = useStorage<string[]>(
    `${resolvedStorageKey.value}:hidden-cols`,
    props.config.columns.filter((c) => c.hidden).map((c) => c.key),
);

// `computed` com get/set mantém o v-model do template tipado como o valor puro.
const viewMode = computed<ViewMode>({
    get: () => viewModeState.value,
    set: (value) => (viewModeState.value = value),
});
const hiddenColumns = computed<string[]>({
    get: () => hiddenColumnsState.value,
    set: (value) => (hiddenColumnsState.value = value),
});

const visibleColumns = computed(() =>
    props.config.columns.filter((c) => !hiddenColumns.value.includes(c.key)),
);

// Só faz sentido oferecer a seleção de "todos os registros" quando existem
// registros além dos que já estão visíveis na tela.
const hasRecordsBeyondShown = computed(
    () => viewer.pagination.value.total > viewer.rows.value.length,
);

function onSearch(term: string) {
    selection?.clear();
    viewer.setSearch(term);
}

function onApplyFilters(filters: FilterValues) {
    selection?.clear();
    viewer.setFilters(filters);
}

function onRemoveFilter(key: string) {
    selection?.clear();
    const next = clone(viewer.query.filter);
    delete next[key];
    viewer.setFilters(next);
}

function onClearAllFilters() {
    selection?.clear();
    viewer.setFilters({});
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Barra superior: pesquisa, filtros, colunas e toggle de modo -->
        <DataViewerToolbar
            v-model:view-mode="viewMode"
            v-model:hidden-columns="hiddenColumns"
            :config="config"
            :query="viewer.query"
            @search="onSearch"
            @apply-filters="onApplyFilters"
        />

        <!-- Tags de filtros ativos com remoção rápida -->
        <DataViewerActiveFilters
            v-if="config.filters.length > 0"
            :filters="config.filters"
            :applied="viewer.query.filter"
            @remove="onRemoveFilter"
            @clear-all="onClearAllFilters"
        />

        <!-- Barra de ações em massa: exibida apenas quando há registros além dos visíveis -->
        <div
            v-if="selection && selection.count > 0 && hasRecordsBeyondShown"
            class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/60 p-2.5 text-sm"
        >
            <div class="flex items-center gap-2">
                <Badge variant="secondary">
                    {{ resolvedLabels.selected(selection.count) }}
                </Badge>

                <button
                    v-if="!selection.all && viewer.pagination.value.total > selection.count"
                    type="button"
                    class="text-xs font-medium text-primary hover:underline hover:cursor-pointer"
                    @click="selection.selectAll"
                >
                    {{ resolvedLabels.selectAll(viewer.pagination.value.total) }}
                </button>

                <span
                    v-else-if="selection.all"
                    class="text-xs text-muted-foreground"
                >
                    {{ resolvedLabels.allSelected(viewer.pagination.value.total) }}
                </span>

                <Button
                    variant="ghost"
                    size="xs"
                    @click="selection.clear"
                >
                    {{ resolvedLabels.clearSelection }}
                </Button>
            </div>

            <div class="flex items-center gap-2">
                <slot
                    name="bulk-actions"
                    :count="selection.count"
                    :payload="selection.payload"
                    :clear="selection.clear"
                />
            </div>
        </div>

        <!-- Área de dados: Tabela ou Grid de Cards -->
        <div class="w-full">
            <DataViewerTable
                v-if="viewMode === 'table'"
                :columns="visibleColumns"
                :rows="viewer.rows.value"
                :row-key="config.rowKey"
                :sort="viewer.query.sort"
                :selection="selection"
                :record-url-key="config.recordUrlKey"
                :storage-key="resolvedStorageKey"
                :navigate="viewer.navigate"
                @sort="viewer.toggleSort"
            >
                <template
                    v-for="(_, slotName) in $slots"
                    #[slotName]="slotProps"
                >
                    <slot
                        :name="slotName"
                        v-bind="slotProps ?? {}"
                    />
                </template>
            </DataViewerTable>

            <DataViewerGrid
                v-else
                :columns="visibleColumns"
                :rows="viewer.rows.value"
                :row-key="config.rowKey"
                :sort="viewer.query.sort"
                :selection="selection"
                :record-url-key="config.recordUrlKey"
                :navigate="viewer.navigate"
                @sort="viewer.toggleSort"
            >
                <template
                    v-for="(_, slotName) in $slots"
                    #[slotName]="slotProps"
                >
                    <slot
                        :name="slotName"
                        v-bind="slotProps ?? {}"
                    />
                </template>
            </DataViewerGrid>
        </div>

        <!-- Rodapé: contadores, por página, carregar mais e paginação -->
        <DataViewerFooter
            :pagination="viewer.pagination.value"
            :shown="viewer.rows.value.length"
            :per-page-options="resolvedPerPageOptions"
            :loading="viewer.loading.value"
            @page="viewer.setPage"
            @per-page="viewer.setPerPage"
            @load-more="viewer.loadMore"
        />
    </div>
</template>
