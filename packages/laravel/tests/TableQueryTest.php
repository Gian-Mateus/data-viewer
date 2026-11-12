<?php

declare(strict_types=1);

namespace Manadah\DataViewer\Tests;

use Manadah\DataViewer\Column;
use Manadah\DataViewer\Filter;
use Manadah\DataViewer\Tests\Fixtures\SampleTableQuery;
use PHPUnit\Framework\TestCase;

final class TableQueryTest extends TestCase
{
    public function test_filter_display_defaults_to_dropdown(): void
    {
        $tableQuery = new SampleTableQuery;

        $this->assertSame('dropdown', $tableQuery->filterDisplay());
        $this->assertSame('dropdown', $tableQuery->config()['filterDisplay']);
    }

    public function test_filter_display_can_be_overridden(): void
    {
        $this->assertSame('inline', (new SampleTableQuery('inline'))->config()['filterDisplay']);
        $this->assertSame('modal', (new SampleTableQuery('modal'))->config()['filterDisplay']);
    }

    public function test_config_serializes_columns_and_filters(): void
    {
        $config = (new SampleTableQuery)->config();

        $this->assertSame('ulid', $config['rowKey']);
        $this->assertFalse($config['searchable']);
        $this->assertSame('sample', $config['storageKey']);
        $this->assertInstanceOf(Column::class, $config['columns'][0]);
        $this->assertInstanceOf(Filter::class, $config['filters'][0]);

        // config() devolve os objetos e é o json_encode do controller que os achata para o frontend.
        $serialized = json_decode(json_encode($config, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame('name', $serialized['columns'][0]['key']);
        $this->assertSame('is_active', $serialized['filters'][0]['key']);
        $this->assertSame('toggle', $serialized['filters'][0]['type']);
    }

    public function test_searchable_reflects_searchable_columns(): void
    {
        $tableQuery = new class extends SampleTableQuery
        {
            public function searchableColumns(): array
            {
                return ['name', 'description'];
            }
        };

        $this->assertTrue($tableQuery->config()['searchable']);
    }
}
