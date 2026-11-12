import { reactive, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { fetchProvider } from './providers/fetch';
import type { DataViewerProvider } from './providers/types';
import { serializeQuery } from './query';
import type { FilterValues, Paginated, Query } from './types';

export type NavigateFn = (url: string) => void;

export type UseDataViewerOptions<T> = {
    url: string;
    source: () => Paginated<T>;
    initialQuery: Query;
    only?: string[];
    provider?: DataViewerProvider<T>;
    /** Sobrescreve a navegação padrão (clique em linha/card). */
    navigate?: NavigateFn;
};

const defaultNavigate: NavigateFn = (url: string) => {
    if (typeof window !== 'undefined') {
        window.location.assign(url);
    }
};

/**
 * Navega para o registro se o clique não partiu de botões, links ou inputs interativos.
 */
export function navigateRow(
    event: MouseEvent,
    row: Record<string, any>,
    key = 'url',
    navigate: NavigateFn = defaultNavigate,
): void {
    const target = event.target as HTMLElement | null;

    if (target?.closest('button, a, input, [data-slot="checkbox"], [role="menuitem"]')) {
        return;
    }

    const destination = row[key];
    if (destination) {
        navigate(destination);
    }
}

/**
 * Controla os parâmetros que vão para a requisição (pesquisa, filtros, ordenação e página).
 */
export function useDataViewer<T>(options: UseDataViewerOptions<T>) {
    const query = reactive<Query>(options.initialQuery);
    const rows = ref(options.source().data) as Ref<T[]>;
    const pagination = ref(options.source()) as Ref<Paginated<T>>;
    const loading = ref(false);

    const provider = options.provider ?? fetchProvider;
    const navigate: NavigateFn =
        options.navigate ?? (provider.navigate ? provider.navigate.bind(provider) : defaultNavigate);

    let appendNext = false;

    function apply(result: Paginated<T>) {
        rows.value = appendNext ? [...rows.value, ...result.data] : result.data;
        pagination.value = result;
        appendNext = false;
    }

    // Mantém a lista sincronizada quando o backend atualiza os props (Inertia).
    watch(options.source, apply);

    function load(append = false) {
        appendNext = append;

        provider.submit(
            {
                url: options.url,
                params: serializeQuery(query),
                append,
                only: options.only,
            },
            {
                onStart: () => (loading.value = true),
                onSuccess: (result) => apply(result),
                onFinish: () => (loading.value = false),
            },
        );
    }

    function setSearch(search: string) {
        query.search = search;
        query.page = 1;
        load();
    }

    function setFilters(filter: FilterValues) {
        query.filter = filter;
        query.page = 1;
        load();
    }

    function toggleSort(key: string) {
        if (query.sort === key) {
            query.sort = `-${key}`;
        } else if (query.sort === `-${key}`) {
            query.sort = null;
        } else {
            query.sort = key;
        }
        load();
    }

    function setPage(page: number) {
        query.page = page;
        load();
    }

    function setPerPage(perPage: number) {
        query.perPage = perPage;
        query.page = 1;
        load();
    }

    function loadMore() {
        if (pagination.value.current_page >= pagination.value.last_page) {
            return;
        }

        query.page = pagination.value.current_page + 1;
        load(true);
    }

    return {
        query,
        rows,
        pagination,
        loading,
        navigate,
        setSearch,
        setFilters,
        toggleSort,
        setPage,
        setPerPage,
        loadMore,
        navigateRow,
    };
}
