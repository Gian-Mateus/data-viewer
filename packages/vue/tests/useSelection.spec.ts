import { describe, expect, it } from 'vitest';
import { useSelection } from '../src/useSelection';

describe('useSelection', () => {
    it('marca e desmarca chaves', () => {
        const selection = useSelection(() => 100);

        selection.toggle('a');
        expect(selection.isSelected('a')).toBe(true);
        expect(selection.count).toBe(1);
        expect(selection.payload).toEqual({ all: false, ids: ['a'] });

        selection.toggle('a');
        expect(selection.isSelected('a')).toBe(false);
        expect(selection.count).toBe(0);
    });

    it('calcula o estado do checkbox da página', () => {
        const selection = useSelection(() => 100);

        expect(selection.pageState(['a', 'b'])).toBe(false);

        selection.toggle('a');
        expect(selection.pageState(['a', 'b'])).toBe('indeterminate');

        selection.toggle('b');
        expect(selection.pageState(['a', 'b'])).toBe(true);
    });

    it('seleciona todos considerando exceções', () => {
        const selection = useSelection(() => 10);

        selection.selectAll();
        expect(selection.all).toBe(true);
        expect(selection.count).toBe(10);

        selection.toggle('x');
        expect(selection.isSelected('x')).toBe(false);
        expect(selection.count).toBe(9);
        expect(selection.payload).toEqual({ all: true, except: ['x'] });
    });

    it('limpa a seleção', () => {
        const selection = useSelection(() => 10);

        selection.selectAll();
        selection.toggle('x');
        selection.clear();

        expect(selection.all).toBe(false);
        expect(selection.count).toBe(0);
        expect(selection.payload).toEqual({ all: false, ids: [] });
    });

    it('setMany respeita o estado atual', () => {
        const selection = useSelection(() => 10);

        selection.setMany(['a', 'b', 'c'], true);
        expect(selection.count).toBe(3);

        selection.setMany(['b'], false);
        expect(selection.isSelected('a')).toBe(true);
        expect(selection.isSelected('b')).toBe(false);
    });
});
