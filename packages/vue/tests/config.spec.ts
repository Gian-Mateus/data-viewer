import { describe, expect, it } from 'vitest';
import { mergeLabels, defaultLabels } from '../src/config';
import { toSearchParams } from '../src/providers/types';

describe('toSearchParams', () => {
    it('expande filtros aninhados no formato do Laravel', () => {
        const params = toSearchParams({
            search: 'math',
            page: 2,
            filter: { status: 'active', tags: 'a,b' },
        });

        expect(params.toString()).toBe(
            'search=math&page=2&filter%5Bstatus%5D=active&filter%5Btags%5D=a%2Cb',
        );
    });

    it('ignora valores vazios', () => {
        expect(toSearchParams({ search: '', sort: null, page: 1 }).toString()).toBe('page=1');
    });
});

describe('mergeLabels', () => {
    it('mantém os padrões e aplica overrides', () => {
        const labels = mergeLabels({ table: 'Lista', shown: (shown, total) => `${shown}/${total}` });

        expect(labels.table).toBe('Lista');
        expect(labels.cards).toBe(defaultLabels.cards);
        expect(labels.shown(5, 10)).toBe('5/10');
    });

    it('ignora fontes nulas', () => {
        expect(mergeLabels(undefined, { filters: 'Filtrar' }).filters).toBe('Filtrar');
    });
});
