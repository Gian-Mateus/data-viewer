<?php

declare(strict_types=1);

namespace Manadah\DataViewer;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Override;
use Spatie\QueryBuilder\QueryBuilder;

abstract class TableQuery implements TableQueryInterface
{
    #[Override]
    public function columns(): array
    {
        return [];
    }

    #[Override]
    public function sortableColumns(): array
    {
        return [];
    }

    #[Override]
    public function defaultSort(): string
    {
        return $this->sortableColumns()[0] ?? 'created_at';
    }

    #[Override]
    public function searchableColumns(): array
    {
        return [];
    }

    #[Override]
    public function filters(): array
    {
        return [];
    }

    #[Override]
    public function storageKey(): string
    {
        $name = str_replace('TableQuery', '', class_basename(static::class));

        return Str::kebab($name);
    }

    #[Override]
    public function filterDisplay(): string
    {
        return 'dropdown';
    }

    #[Override]
    public function rowKey(): string
    {
        return 'ulid';
    }

    #[Override]
    public function config(): array
    {
        return [
            'rowKey' => $this->rowKey(),
            'columns' => $this->columns(),
            'filters' => $this->filters(),
            'searchable' => count($this->searchableColumns()) > 0,
            'storageKey' => $this->storageKey(),
            'filterDisplay' => $this->filterDisplay(),
        ];
    }

    abstract public function query(Builder|Relation|null $baseQuery = null, ?Request $request = null): QueryBuilder;
}
