<?php

declare(strict_types=1);

namespace Manadah\DataViewer\Tests;

use Manadah\DataViewer\Filter;
use PHPUnit\Framework\TestCase;

final class FilterTest extends TestCase
{
    public function test_select_with_associative_options(): void
    {
        $filter = Filter::select('status', 'Situação')
            ->options(['active' => 'Ativo', 'inactive' => 'Inativo']);

        $this->assertSame([
            'key' => 'status',
            'label' => 'Situação',
            'type' => 'select',
            'options' => [
                ['value' => 'active', 'label' => 'Ativo'],
                ['value' => 'inactive', 'label' => 'Inativo'],
            ],
            'multiple' => false,
        ], $filter->toArray());
    }

    public function test_options_accept_preformatted_list_and_casts_values(): void
    {
        $filter = Filter::checkbox('roles', 'Perfis')
            ->options([
                ['value' => 1, 'label' => 'Admin'],
                ['value' => '2', 'label' => 'Aluno'],
            ]);

        $this->assertSame([
            'key' => 'roles',
            'label' => 'Perfis',
            'type' => 'checkbox',
            'options' => [
                ['value' => '1', 'label' => 'Admin'],
                ['value' => '2', 'label' => 'Aluno'],
            ],
        ], $filter->jsonSerialize());
    }

    public function test_toggle_and_date_range_have_no_options(): void
    {
        $toggle = Filter::toggle('is_modular', 'Modulares')->toArray();
        $range = Filter::dateRange('created_at', 'Cadastro')->toArray();

        $this->assertSame(['key' => 'is_modular', 'label' => 'Modulares', 'type' => 'toggle'], $toggle);
        $this->assertSame(['key' => 'created_at', 'label' => 'Cadastro', 'type' => 'date-range'], $range);
    }

    public function test_select_multiple(): void
    {
        $filter = Filter::select('tags', 'Tags')->options(['a' => 'A'])->multiple();

        $this->assertTrue($filter->toArray()['multiple']);
    }
}
