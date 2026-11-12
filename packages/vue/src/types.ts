// Contrato entre o backend (TableQuery) e o DataViewer.

export type FilterOption = { value: string | number; label: string };

type BaseFilter = { key: string; label: string };

export type SelectFilter = BaseFilter & { type: 'select'; options: FilterOption[]; multiple?: boolean };
export type CheckboxFilter = BaseFilter & { type: 'checkbox'; options: FilterOption[] };
export type RadioFilter = BaseFilter & { type: 'radio'; options: FilterOption[] };
export type ToggleFilter = BaseFilter & { type: 'toggle' };
export type DateRangeFilter = BaseFilter & { type: 'date-range' };

export type Filter = SelectFilter | CheckboxFilter | RadioFilter | ToggleFilter | DateRangeFilter;

export type DateRange = { from: string; to: string };
export type FilterValue = string | string[] | boolean | DateRange | null;
export type FilterValues = Record<string, FilterValue>;

export type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  hideable?: boolean;
  hidden?: boolean;
};

export type DataViewerConfig = {
  rowKey: string;
  columns: Column[];
  filters: Filter[];
  searchable: boolean;
  storageKey?: string;
  filterDisplay?: 'dropdown' | 'inline' | 'modal';
  recordUrlKey?: string; // campo da linha que contém a URL de detalhes (padrão: 'url')
  perPageOptions?: number[];
};

// Estado que vai para a URL / requisição.
export type Query = {
  search: string;
  sort: string | null; // 'name' (asc), '-name' (desc)
  filter: FilterValues;
  page: number;
  perPage: number | null;
};

// Estrutura de paginação nativa retornada pelo Laravel LengthAwarePaginator
export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

export type ViewMode = 'table' | 'grid';
