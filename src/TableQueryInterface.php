<?php

declare(strict_types=1);

namespace Manadah\DataViewer;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * Contrato para queries de listagem padronizadas do DataViewer.
 *
 * Cada tela que consome o DataViewer deve implementar esta interface
 * garantindo ordenação por whitelist, busca textual consistente e
 * configuração serializável para o frontend.
 */
interface TableQueryInterface
{
    /**
     * Retorna a lista de colunas visíveis da tabela.
     *
     * @return array<int, array{key: string, label: string, sortable?: bool, hideable?: bool, hidden?: bool}>
     */
    public function columns(): array;

    /**
     * Retorna a lista de colunas permitidas para ordenação via `sort`.
     *
     * @return array<int, string>
     */
    public function sortableColumns(): array;

    /**
     * Retorna a ordenação padrão caso nenhuma seja especificada no request.
     */
    public function defaultSort(): string;

    /**
     * Retorna a lista de filtros permitidos na tabela.
     *
     * @return array<int, array<string, mixed>>
     */
    public function filters(): array;

    /**
     * Retorna a lista explícita de colunas pesquisáveis pelo parâmetro global `search``.
     *
     * @return array<int, string>
     */
    public function searchableColumns(): array;

    /**
     * Define a chave estável de persistência no frontend (localStorage).
     */
    public function storageKey(): string;

    /**
     * Define o modo de exibição dos filtros no frontend.
     */
    public function filterDisplay(): string;

    /**
     * Retorna a configuração completa serializada para o DataViewer do frontend.
     *
     * @return array<string, mixed>
     */
    public function config(): array;

    /**
     * Constrói e retorna a instância do Spatie QueryBuilder configurada com
     * ordenações permitidas, filtros e escopo de busca textual.
     */
    public function query(Builder|Relation|null $baseQuery = null, ?Request $request = null): QueryBuilder;

    /**
     * Retorna a chave primária única da linha (padrão: 'ulid').
     */
    public function rowKey(): string;
}
