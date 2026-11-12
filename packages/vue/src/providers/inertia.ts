import { router } from '@inertiajs/vue3';
import type { DataViewerCallbacks, DataViewerProvider, DataViewerRequest } from './types';
import { createFetchProvider } from './fetch';

export interface InertiaProviderOptions {
    /**
     * `page` faz um visit do Inertia e recebe os novos props (o DataViewer
     * observa a prop `data`). `http` busca JSON sem trocar de página, como o
     * `useHttp` do Inertia.
     */
    mode?: 'page' | 'http';
    /** Repassa headers extras no modo `http`. */
    headers?: Record<string, string> | (() => Record<string, string>);
}

/**
 * Provider para aplicações Inertia + Laravel. Importe por
 * `@manadah/data-viewer/inertia` para manter o Inertia opcional.
 */
export function createInertiaProvider(options: InertiaProviderOptions = {}): DataViewerProvider {
    const mode = options.mode ?? 'page';
    const http = createFetchProvider({ headers: options.headers });

    return {
        submit(request: DataViewerRequest, callbacks: DataViewerCallbacks<any>): void {
            if (mode === 'http') {
                http.submit(request, callbacks);
                return;
            }

            router.get(request.url, request.params as Record<string, any>, {
                only: request.only,
                preserveState: true,
                preserveScroll: true,
                replace: true,
                preserveUrl: request.append,
                onStart: () => callbacks.onStart?.(),
                onError: (error) => callbacks.onError?.(error),
                onFinish: () => callbacks.onFinish?.(),
            });
        },
        navigate(url: string): void {
            router.visit(url);
        },
    };
}
