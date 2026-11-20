import type { Paginated } from '../types';
import { toSearchParams } from './types';
import type { DataViewerCallbacks, DataViewerProvider, DataViewerRequest } from './types';

export interface FetchProviderOptions {
    /** Cabeçalhos extras (ex.: Authorization). */
    headers?: Record<string, string> | (() => Record<string, string>);
    /** Enviado como `credentials` do fetch. Padrão: `same-origin`. */
    credentials?: RequestCredentials;
    /** Converte a resposta bruta no paginador. Padrão: `response.json()`. */
    parse?: (response: Response) => Promise<Paginated<any>>;
    /** Constrói a URL final. Padrão: `url?query`. */
    buildUrl?: (request: DataViewerRequest) => string;
}

function defaultBuildUrl(request: DataViewerRequest): string {
    const search = toSearchParams(request.params).toString();

    return search ? `${request.url}?${search}` : request.url;
}

/**
 * Provider padrão, sem dependências de framework. Consome endpoints que
 * devolvem o paginador padrão do Laravel (LengthAwarePaginator).
 */
export function createFetchProvider(options: FetchProviderOptions = {}): DataViewerProvider {
    const buildUrl = options.buildUrl ?? defaultBuildUrl;
    const parse = options.parse ?? ((response: Response) => response.json());

    return {
        submit(request: DataViewerRequest, callbacks: DataViewerCallbacks<any>): void {
            const headers =
                typeof options.headers === 'function' ? options.headers() : options.headers;

            callbacks.onStart?.();

            fetch(buildUrl(request), {
                method: 'GET',
                credentials: options.credentials ?? 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...headers,
                },
            })
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`DataViewer request failed with status ${response.status}`);
                    }

                    return parse(response);
                })
                .then((result) => callbacks.onSuccess?.(result))
                .catch((error) => callbacks.onError?.(error))
                .finally(() => callbacks.onFinish?.());
        },
        navigate(url: string): void {
            window.location.assign(url);
        },
    };
}

export const fetchProvider = createFetchProvider();
