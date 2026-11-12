import type { Filter, FilterValue, FilterValues, Query } from './types';

export function emptyQuery(): Query {
  return { search: '', sort: null, filter: {}, page: 1, perPage: null };
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** Valida se o valor do filtro é vazio ou nulo. */
export function isEmptyFilterValue(value: unknown): value is null | undefined | false | '' {
  return value === null || value === undefined || value === false || value === '';
}

/** Converte o valor do filtro para a string esperada pelo Spatie (arrays/ranges viram "a,b"). */
function toParam(value: FilterValue | undefined): string | null {
  if (isEmptyFilterValue(value)) {
    return null;
  }

  if (value === true) {
    return 'true';
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(',') : null;
  }

  if (typeof value === 'object') {
    return value.from || value.to ? `${value.from},${value.to}` : null;
  }

  return String(value);
}

export function isActive(value: FilterValue | undefined): boolean {
  return toParam(value) !== null;
}

/** Converte o texto da URL de volta para o valor que o componente de filtro espera. */
function parseFilterParam(filter: Filter, raw: string): FilterValue {
  switch (filter.type) {
    case 'toggle':
      return raw === 'true';
    case 'checkbox':
      return raw.split(',');
    case 'select':
      return filter.multiple ? raw.split(',') : raw;
    case 'date-range': {
      const [from = '', to = ''] = raw.split(',');
      return { from, to };
    }
    default:
      return raw;
  }
}

/**
 * Converte o estado do DataViewer em parâmetros simples para a requisição.
 */
export function serializeQuery(query: Query): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  // 1. Agrupa os filtros preenchidos
  const filter: Record<string, string> = {};
  for (const [key, value] of Object.entries(query.filter)) {
    const formatted = toParam(value);
    if (formatted !== null) {
      filter[key] = formatted;
    }
  }

  if (Object.keys(filter).length > 0) {
    params.filter = filter;
  }

  // 2. Parâmetros principais
  if (query.search) {
    params.search = query.search;
  }

  if (query.sort) {
    params.sort = query.sort;
  }

  if (query.page > 1) {
    params.page = query.page;
  }

  if (query.perPage) {
    params.per_page = query.perPage;
  }

  return params;
}

/** Lê os parâmetros da URL para restaurar a busca, ordenação e filtros ativos. */
export function parseQuery(url: string, filters: Filter[]): Query {
  const params = new URL(url, 'http://localhost').searchParams;
  const filter: FilterValues = {};

  for (const item of filters) {
    const raw = params.get(`filter[${item.key}]`);
    if (raw !== null) {
      filter[item.key] = parseFilterParam(item, raw);
    }
  }

  return {
    search: params.get('search') ?? '',
    sort: params.get('sort'),
    filter,
    page: Number(params.get('page') ?? 1),
    perPage: params.has('per_page') ? Number(params.get('per_page')) : null,
  };
}

export function sortDirection(sort: string | null, key: string): 'asc' | 'desc' | null {
  if (sort === key) return 'asc';
  if (sort === `-${key}`) return 'desc';
  return null;
}
