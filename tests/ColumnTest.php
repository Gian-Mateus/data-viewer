<?php

declare(strict_types=1);

namespace Manadah\DataViewer\Tests;

use Manadah\DataViewer\Column;
use PHPUnit\Framework\TestCase;

final class ColumnTest extends TestCase
{
    public function test_make_defaults(): void
    {
        $column = Column::make('name', 'Nome');

        $this->assertSame([
            'key' => 'name',
            'label' => 'Nome',
            'sortable' => false,
            'hideable' => true,
            'hidden' => false,
        ], $column->toArray());
    }

    public function test_fluent_builders(): void
    {
        $column = Column::make('status', 'Situação')
            ->sortable()
            ->hideable(false)
            ->hidden();

        $this->assertTrue($column->getSortable());
        $this->assertSame([
            'key' => 'status',
            'label' => 'Situação',
            'sortable' => true,
            'hideable' => false,
            'hidden' => true,
        ], $column->jsonSerialize());
    }
}
