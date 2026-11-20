import { describe, expect, it } from 'vitest';
import {
    emptyQuery,
    isActive,
    parseQuery,
    serializeQuery,
    sortDirection,
} from '../../resources/js/data-viewer/query';
import type { Filter, Query } from '../../resources/js/data-viewer/types';

const filters: Filter[] = [
    { type: 'select', key: 'status', label: 'Situação', options: [] },
    { type: 'checkbox', key: 'tags', label: 'Tags', options: [] },
    { type: 'toggle', key: 'active', label: 'Ativo' },
    { type: 'date-range', key: 'created', label: 'Criado em' },
];

function query(overrides: Partial<Query> = {}): Query {
    return { ...emptyQuery(), ...overrides };
}

describe('serializeQuery', () => {
    it('omite valores vazios', () => {
        expect(serializeQuery(query())).toEqual({});
    });

    it('serializa filtros, busca, ordenação e paginação', () => {
        const result = serializeQuery(
            query({
                search: 'joão',
                sort: '-name',
                page: 3,
                perPage: 50,
                filter: {
                    status: 'active',
                    tags: ['a', 'b'],
                    active: true,
                    created: { from: '2026-01-01', to: '2026-01-31' },
                },
            }),
        );

        expect(result).toEqual({
            filter: {
                status: 'active',
                tags: 'a,b',
                active: 'true',
                created: '2026-01-01,2026-01-31',
            },
            search: 'joão',
            sort: '-name',
            page: 3,
            per_page: 50,
        });
    });

    it('não envia página 1', () => {
        expect(serializeQuery(query({ page: 1 }))).toEqual({});
    });
});

describe('parseQuery', () => {
    it('restaura o estado a partir da URL', () => {
        const parsed = parseQuery(
            'https://app.test/cursos?search=math&sort=name&page=2&per_page=30&filter[status]=active&filter[tags]=a,b&filter[active]=true&filter[created]=2026-01-01,2026-01-31',
            filters,
        );

        expect(parsed).toEqual({
            search: 'math',
            sort: 'name',
            page: 2,
            perPage: 30,
            filter: {
                status: 'active',
                tags: ['a', 'b'],
                active: true,
                created: { from: '2026-01-01', to: '2026-01-31' },
            },
        });
    });

    it('usa valores padrão quando a URL está vazia', () => {
        expect(parseQuery('https://app.test/cursos', filters)).toEqual(emptyQuery());
    });
});

describe('isActive', () => {
    it.each([
        [null, false],
        [undefined, false],
        ['', false],
        [false, false],
        [[], false],
        [{ from: '', to: '' }, false],
        ['x', true],
        [true, true],
        [['a'], true],
        [{ from: '2026-01-01', to: '' }, true],
    ])('isActive(%j) === %j', (value, expected) => {
        expect(isActive(value as any)).toBe(expected);
    });
});

describe('sortDirection', () => {
    it('detecta asc, desc e nulo', () => {
        expect(sortDirection('name', 'name')).toBe('asc');
        expect(sortDirection('-name', 'name')).toBe('desc');
        expect(sortDirection('other', 'name')).toBeNull();
        expect(sortDirection(null, 'name')).toBeNull();
    });
});
