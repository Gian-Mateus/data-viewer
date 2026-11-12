import { computed, reactive, ref } from 'vue';

/**
 * Gerencia a seleção de itens de forma agnóstica à visualização (Tabela ou Cards)
 * e persistente entre páginas da paginação.
 *
 * Estratégia de seleção:
 * - `all = false`: seleção pontual. `keys` guarda os IDs explicitamente marcados.
 * - `all = true`: "selecionar todos os X resultados". `keys` passa a guardar as exceções (desmarcados).
 */
export function useSelection(total: () => number) {
  const all = ref(false);
  const keys = ref(new Set<string>());

  function isSelected(key: string): boolean {
    return all.value ? !keys.value.has(key) : keys.value.has(key);
  }

  function toggle(key: string) {
    if (keys.value.has(key)) {
      keys.value.delete(key);
    } else {
      keys.value.add(key);
    }
  }

  function setMany(list: string[], selected: boolean) {
    for (const key of list) {
      if (isSelected(key) !== selected) {
        toggle(key);
      }
    }
  }

  /**
   * Determina o estado visual do checkbox mestre do cabeçalho da página atual:
   * - `true`: Todos os itens visíveis na página atual estão selecionados.
   * - `false`: Nenhum item visível na página atual está selecionado.
   * - `'indeterminate'`: Alguns itens estão selecionados, exibindo o ícone de traço horizontal (-).
   */
  function pageState(visibleKeys: string[]): boolean | 'indeterminate' {
    const selectedCount = visibleKeys.filter(isSelected).length;

    if (selectedCount === 0) return false;
    if (selectedCount === visibleKeys.length) return true;

    return 'indeterminate';
  }

  function selectAll() {
    all.value = true;
    keys.value.clear();
  }

  function clear() {
    all.value = false;
    keys.value.clear();
  }

  const count = computed(() => (all.value ? total() - keys.value.size : keys.value.size));

  // Payload formatado para envio no endpoint de ação em massa.
  const payload = computed(() =>
    all.value
      ? { all: true, except: [...keys.value] }
      : { all: false, ids: [...keys.value] },
  );

  return reactive({
    all,
    count,
    payload,
    isSelected,
    toggle,
    setMany,
    pageState,
    selectAll,
    clear,
  });
}

export type Selection = ReturnType<typeof useSelection>;
