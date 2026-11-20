import { getCurrentInstance, inject } from 'vue';
import type { InjectionKey } from 'vue';
import { createInertiaProvider } from './providers/inertia';
import type { DataViewerProvider } from './providers/types';
import type { ViewMode } from './types';

/**
 * Textos da interface. Podem ser editados diretamente aqui (padrão global)
 * ou sobrescritos via prop `labels` do `<DataViewer>`.
 */
export interface DataViewerLabels {
    table: string;
    cards: string;
    columns: string;
    searchPlaceholder: string;
    filters: string;
    apply: string;
    applyFilters: string;
    clear: string;
    clearAll: string;
    filterTitle: string;
    filterDescription: string;
    cancel: string;
    activeFilters: string;
    removeFilter: (label: string) => string;
    perPage: string;
    shown: (shown: number, total: number) => string;
    loadMore: string;
    selected: (count: number) => string;
    selectAll: (total: number) => string;
    allSelected: (total: number) => string;
    clearSelection: string;
    selectPeriod: string;
    fromDate: (date: string) => string;
    dateRange: (from: string, to: string) => string;
    resizeColumn: string;
    copy: string;
    copied: string;
    copyError: string;
    noValue: string;
    expand: string;
    collapse: string;
    selectAllOptions: string;
    allOption: string;
}

export const defaultLabels: DataViewerLabels = {
    table: 'Tabela',
    cards: 'Cards',
    columns: 'Colunas',
    searchPlaceholder: 'Pesquisar... (Enter)',
    filters: 'Filtros',
    apply: 'Aplicar',
    applyFilters: 'Aplicar filtros',
    clear: 'Limpar',
    clearAll: 'Limpar tudo',
    filterTitle: 'Filtrar registros',
    filterDescription: 'Ajuste as condições abaixo e clique em aplicar para filtrar os resultados.',
    cancel: 'Cancelar',
    activeFilters: 'Filtros ativos:',
    removeFilter: (label: string) => `Remover filtro ${label}`,
    perPage: 'Por página:',
    shown: (shown: number, total: number) => `Exibindo ${shown} de ${total} registros.`,
    loadMore: 'Carregar mais',
    selected: (count: number) => `${count} selecionado(s)`,
    selectAll: (total: number) => `Selecionar todos os ${total} registros`,
    allSelected: (total: number) => `Todos os ${total} registros selecionados.`,
    clearSelection: 'Limpar',
    selectPeriod: 'Selecione o período...',
    fromDate: (date: string) => `A partir de ${date}`,
    dateRange: (from: string, to: string) => (from === to ? from : `${from} até ${to}`),
    resizeColumn: 'Redimensionar coluna',
    copy: 'Copiar',
    copied: 'Copiado para a área de transferência!',
    copyError: 'Erro ao copiar para a área de transferência.',
    noValue: '-',
    expand: '(mais)',
    collapse: '(menos)',
    selectAllOptions: 'Todos',
    allOption: 'Todos',
};

/** Configuração padrão aplicada a todos os `<DataViewer>`. Edite conforme o projeto. */
export interface DataViewerDefaults {
    provider: DataViewerProvider;
    labels: DataViewerLabels;
    locale: string;
    storageKey: string;
    defaultViewMode: ViewMode;
    perPageOptions: number[];
}

export const defaultConfig: DataViewerDefaults = {
    provider: createInertiaProvider(),
    labels: defaultLabels,
    locale: 'pt-BR',
    storageKey: 'data-viewer',
    defaultViewMode: 'table',
    perPageOptions: [15, 30, 50, 100],
};

/** Contexto resolvido no `<DataViewer>` e repassado aos componentes internos. */
export interface DataViewerContext {
    provider: DataViewerProvider;
    labels: DataViewerLabels;
    locale: string;
    storageKey?: string;
    defaultViewMode?: ViewMode;
    perPageOptions?: number[];
}

export const DATA_VIEWER_CONTEXT: InjectionKey<DataViewerContext> = Symbol.for(
    'manadah:data-viewer:context',
);

export function mergeLabels(
    ...sources: Array<Partial<DataViewerLabels> | undefined>
): DataViewerLabels {
    return Object.assign({}, defaultLabels, ...sources.filter(Boolean));
}

function safeInject<T>(key: InjectionKey<T>): T | undefined {
    return getCurrentInstance() ? inject(key) : undefined;
}

export function useDataViewerContext(): DataViewerContext {
    return (
        safeInject(DATA_VIEWER_CONTEXT) ?? {
            provider: defaultConfig.provider,
            labels: defaultConfig.labels,
            locale: defaultConfig.locale,
        }
    );
}

/** Atalho para uso nos componentes internos. */
export function useLabels(): DataViewerLabels {
    return useDataViewerContext().labels;
}
