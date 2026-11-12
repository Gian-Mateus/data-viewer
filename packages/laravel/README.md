# manadah/data-viewer (Laravel)

Contrato PHP do DataViewer: classes fluentes para colunas e filtros, mais a classe abstrata `TableQuery` que gera a configuração serializada para o `<DataViewer>` do frontend.

```bash
composer require manadah/data-viewer
```

Distribuído via subtree split em `github.com/manadah/data-viewer-php`.

## TableQuery

```php
<?php

declare(strict_types=1);

namespace Domain\Course\Queries;

use Domain\Course\Models\Course;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Manadah\DataViewer\Column;
use Manadah\DataViewer\Filter;
use Manadah\DataViewer\TableQuery;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class CourseTableQuery extends TableQuery
{
    public function rowKey(): string
    {
        return 'ulid';
    }

    public function searchableColumns(): array
    {
        return ['name', 'description'];
    }

    public function columns(): array
    {
        return [
            Column::make('name', 'Nome')->sortable(),
            Column::make('description', 'Descrição'),
            Column::make('status', 'Situação')->sortable(),
            Column::make('is_modular', 'Modular?')->sortable()->hideable(),
        ];
    }

    public function filters(): array
    {
        return [
            Filter::select('status', 'Situação')->options([
                'active' => 'Ativo',
                'inactive' => 'Inativo',
            ]),
            Filter::toggle('is_modular', 'Apenas modulares'),
            Filter::dateRange('created_at', 'Cadastrados em'),
        ];
    }

    public function filterDisplay(): string
    {
        return 'dropdown';
    }

    public function query(Builder|Relation|null $baseQuery = null, ?Request $request = null): QueryBuilder
    {
        return QueryBuilder::for($baseQuery ?? Course::query(), $request)
            ->allowedSorts('name', 'status', 'is_modular')
            ->defaultSort('name')
            ->allowedFilters(AllowedFilter::exact('status'), AllowedFilter::exact('is_modular'))
            ->when($request?->filled('search'), function (Builder $query) use ($request): void {
                $query->where('name', 'like', '%'.trim((string) $request->input('search')).'%');
            });
    }
}
```

## No controller

```php
public function index(Request $request): InertiaResponse
{
    $tableQuery = new CourseTableQuery();

    return Inertia::render('gestor/courses/Index', [
        'courses' => $tableQuery->query(request: $request)->paginate(perPage: $request->integer('per_page', 15)),
        'config' => $tableQuery->config(),
    ]);
}
```

`config()` devolve `rowKey`, `columns`, `filters`, `searchable`, `storageKey` e `filterDisplay` no formato consumido por `DataViewerConfig` no Vue.

## Classes

| Classe | Descrição |
|---|---|
| `TableQuery` | Classe abstrata com defaults para `sortableColumns()`, `searchableColumns()`, `filters()`, `rowKey()`, `storageKey()`, `filterDisplay()` |
| `TableQueryInterface` | Contrato implementado por `TableQuery` |
| `Column` | `make()`, `sortable()`, `hideable()`, `hidden()`, `toArray()`, `jsonSerialize()` |
| `Filter` | `select()`, `checkbox()`, `radio()`, `toggle()`, `dateRange()`, `options()`, `multiple()` |
