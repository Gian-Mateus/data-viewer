import type { Paginated } from '../types';

export interface DataViewerRequest {
    /** URL base da listagem. */
    url: string;
    /** Parâmetros já serializados (search, sort, filter, page, per_page). */
    params: Record<string, unknown>;
    /** `true` quando é um "carregar mais" (append em vez de substituir). */
    append: boolean;
    /** Props parciais a recarregar (modo Inertia). */
    only?: string[];
}

export interface DataViewerCallbacks<T> {
    onStart?: () => void;
    onSuccess?: (result: Paginated<T>) => void;
    onFinish?: () => void;
    onError?: (error: unknown) => void;
}

/**
 * Contrato mínimo para buscar dados. Implemente para trocar Inertia por
 * fetch, axios, TanStack Query, etc.
 */
export interface DataViewerProvider<T = any> {
    submit(request: DataViewerRequest, callbacks: DataViewerCallbacks<T>): void;
    /** Navegação ao clicar em uma linha/card. Padrão: `window.location.assign`. */
    navigate?(url: string): void;
}

/** Expande `{ filter: { status: 'active' } }` para `filter[status]=active`. */
export function toSearchParams(params: Record<string, unknown>): URLSearchParams {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === '') {
            continue;
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
            for (const [nestedKey, nestedValue] of Object.entries(value as Record<string, unknown>)) {
                if (nestedValue === null || nestedValue === undefined || nestedValue === '') {
                    continue;
                }
                search.append(`${key}[${nestedKey}]`, String(nestedValue));
            }
            continue;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => search.append(`${key}[]`, String(item)));
            continue;
        }

        search.append(key, String(value));
    }

    return search;
}
