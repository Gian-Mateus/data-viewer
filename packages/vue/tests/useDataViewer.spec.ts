import { describe, expect, it, vi } from 'vitest';
import { useDataViewer } from '../src/useDataViewer';
import type { DataViewerProvider, DataViewerRequest } from '../src/providers/types';
import type { Paginated } from '../src/types';

function page(overrides: Partial<Paginated<any>> = {}): Paginated<any> {
    return {
        data: [{ id: 1 }],
        current_page: 1,
        last_page: 3,
        per_page: 15,
        total: 45,
        from: 1,
        to: 15,
        ...overrides,
    };
}

function fakeProvider() {
    const requests: DataViewerRequest[] = [];
    const provider: DataViewerProvider = {
        submit: vi.fn((request, callbacks) => {
            requests.push(request);
            callbacks.onSuccess?.(page());
        }),
        navigate: vi.fn(),
    };

    return { provider, requests };
}

describe('useDataViewer', () => {
    it('envia busca, filtro e ordenação pelo provider', () => {
        const { provider, requests } = fakeProvider();
        const viewer = useDataViewer({
            url: '/cursos',
            source: () => page(),
            initialQuery: { search: '', sort: null, filter: {}, page: 1, perPage: null },
            provider,
        });

        viewer.setSearch('math');
        expect(requests.at(-1)?.params).toEqual({ search: 'math' });

        viewer.setFilters({ status: 'active' });
        expect(requests.at(-1)?.params).toEqual({
            search: 'math',
            filter: { status: 'active' },
        });

        viewer.toggleSort('name');
        expect(requests.at(-1)?.params.sort).toBe('name');

        viewer.toggleSort('name');
        expect(requests.at(-1)?.params.sort).toBe('-name');

        viewer.toggleSort('name');
        expect(requests.at(-1)?.params.sort).toBeUndefined();
    });

    it('reseta a página ao buscar ou filtrar', () => {
        const { provider, requests } = fakeProvider();
        const viewer = useDataViewer({
            url: '/cursos',
            source: () => page(),
            initialQuery: { search: '', sort: null, filter: {}, page: 1, perPage: null },
            provider,
        });

        viewer.setPage(3);
        expect(requests.at(-1)?.params.page).toBe(3);

        viewer.setSearch('x');
        expect(requests.at(-1)?.params.page).toBeUndefined();
        expect(viewer.query.page).toBe(1);
    });

    it('acumula resultados no carregar mais', () => {
        const { provider } = fakeProvider();
        const viewer = useDataViewer({
            url: '/cursos',
            source: () => page({ data: [{ id: 1 }], current_page: 1, last_page: 3 }),
            initialQuery: { search: '', sort: null, filter: {}, page: 1, perPage: null },
            provider,
        });

        expect(viewer.rows.value).toHaveLength(1);
        viewer.loadMore();
        expect(viewer.rows.value).toHaveLength(2);
    });

    it('não carrega mais na última página', () => {
        const { provider, requests } = fakeProvider();
        const viewer = useDataViewer({
            url: '/cursos',
            source: () => page({ current_page: 3, last_page: 3 }),
            initialQuery: { search: '', sort: null, filter: {}, page: 1, perPage: null },
            provider,
        });

        viewer.loadMore();
        expect(requests).toHaveLength(0);
    });

    it('usa a navegação do provider', () => {
        const { provider } = fakeProvider();
        const viewer = useDataViewer({
            url: '/cursos',
            source: () => page(),
            initialQuery: { search: '', sort: null, filter: {}, page: 1, perPage: null },
            provider,
        });

        viewer.navigate('/cursos/1');
        expect(provider.navigate).toHaveBeenCalledWith('/cursos/1');
    });
});
