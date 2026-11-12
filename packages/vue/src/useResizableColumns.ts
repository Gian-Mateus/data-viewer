import { computed, onBeforeUnmount } from 'vue';
import { useStorage } from '@vueuse/core';

const MIN_COL_WIDTH = 80;
const MAX_COL_WIDTH = 640;

export function useResizableColumns(storageKey: string) {
  const widthsKey = computed(() => `${storageKey}:table-column-widths`);

  const columnWidths = useStorage<Record<string, number>>(widthsKey.value, {}, localStorage, {
    mergeDefaults: true,
  });

  const hasSavedWidths = computed(() => Object.keys(columnWidths.value).length > 0);

  const tableClass = computed(() => (hasSavedWidths.value ? 'table-fixed' : ''));

  function colStyle(key: string) {
    const width = columnWidths.value[key];

    return width ? { width: `${width}px` } : undefined;
  }

  let drag: { key: string; startX: number; startWidth: number } | null = null;

  function clamp(value: number) {
    return Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, value));
  }

  function startResize(event: MouseEvent, key: string) {
    event.preventDefault();
    event.stopPropagation();

    const header = (event.currentTarget as HTMLElement)?.parentElement;
    const currentWidth = columnWidths.value[key] ?? header?.getBoundingClientRect().width ?? 120;

    drag = {
      key,
      startX: event.clientX,
      startWidth: currentWidth,
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function onMove(event: MouseEvent) {
    if (!drag) {
      return;
    }

    const nextWidth = clamp(drag.startWidth + (event.clientX - drag.startX));

    columnWidths.value = { ...columnWidths.value, [drag.key]: nextWidth };
  }

  function onUp() {
    if (!drag) {
      return;
    }

    drag = null;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  function resetColumn(key: string) {
    if (!columnWidths.value[key]) {
      return;
    }

    const { [key]: _removed, ...rest } = columnWidths.value;

    columnWidths.value = rest;
  }

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  return {
    columnWidths,
    hasSavedWidths,
    tableClass,
    colStyle,
    startResize,
    resetColumn,
  };
}