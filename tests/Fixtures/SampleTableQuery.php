<?php

declare(strict_types=1);

namespace Manadah\DataViewer\Tests\Fixtures;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use LogicException;
use Manadah\DataViewer\Column;
use Manadah\DataViewer\Filter;
use Manadah\DataViewer\TableQuery;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * Fixture nomeada (não anônima) para que storageKey() derive "sample".
 */
class SampleTableQuery extends TableQuery
{
    public function __construct(private readonly ?string $filterDisplay = null) {}

    public function columns(): array
    {
        return [Column::make('name', 'Nome')->sortable()];
    }

    public function filters(): array
    {
        return [Filter::toggle('is_active', 'Apenas ativos')];
    }

    public function filterDisplay(): string
    {
        return $this->filterDisplay ?? parent::filterDisplay();
    }

    public function query(Builder|Relation|null $baseQuery = null, ?Request $request = null): QueryBuilder
    {
        throw new LogicException('query() não é chamado nos testes de contrato.');
    }
}
