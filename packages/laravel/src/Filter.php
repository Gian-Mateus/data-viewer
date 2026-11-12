<?php

declare(strict_types=1);

namespace Manadah\DataViewer;

use Illuminate\Contracts\Support\Arrayable;
use JsonSerializable;

/**
 * Construtor fluente para definição de filtros da tabela/grid.
 *
 * Mapeia os 5 tipos de filtros suportados pelo DataViewer:
 * - 'select'     => Dropdown de seleção simples ou múltipla.
 * - 'checkbox'   => Lista de checkboxes verticais para seleção múltipla.
 * - 'radio'      => Lista de radio buttons verticais para seleção única exclusiva.
 * - 'toggle'     => Interruptor booleano (Sim / Não).
 * - 'date-range' => Seletor de período com calendário (data início até data fim).
 *
 * @implements Arrayable<string, mixed>
 */
class Filter implements Arrayable, JsonSerializable
{
    /**
     * Lista de opções estruturadas para o frontend no formato:
     * [ ['value' => 'ativo', 'label' => 'Ativo'], ... ]
     *
     * @var array<int, array{value: string, label: string}>
     */
    protected array $options = [];

    /** Se o filtro de seleção aceita múltiplos valores simultâneos. */
    protected bool $multiple = false;

    /**
     * @param  string  $key  Nome do parâmetro esperado pelo Spatie QueryBuilder (ex.: 'status' -> ?filter[status]=...).
     * @param  string  $label  Rótulo exibido para o usuário na barra lateral de filtros (ex.: 'Situação').
     * @param  string  $type  Tipo do componente de filtro no frontend ('select'|'checkbox'|'radio'|'toggle'|'date-range').
     */
    public function __construct(
        protected string $key,
        protected string $label,
        protected string $type,
    ) {}

    /**
     * Cria um filtro de dropdown (Select).
     *
     * @param  string  $key  Nome do filtro (ex.: 'status').
     * @param  string  $label  Rótulo do filtro (ex.: 'Situação').
     */
    public static function select(string $key, string $label): static
    {
        return new static($key, $label, 'select');
    }

    /**
     * Cria um filtro de múltipla escolha com caixas de seleção (Checkbox).
     *
     * @param  string  $key  Nome do filtro (ex.: 'roles').
     * @param  string  $label  Rótulo do filtro (ex.: 'Perfis de Acesso').
     */
    public static function checkbox(string $key, string $label): static
    {
        return new static($key, $label, 'checkbox');
    }

    /**
     * Cria um filtro de escolha única exclusiva com botões de rádio (Radio).
     *
     * @param  string  $key  Nome do filtro (ex.: 'gender').
     * @param  string  $label  Rótulo do filtro (ex.: 'Gênero').
     */
    public static function radio(string $key, string $label): static
    {
        return new static($key, $label, 'radio');
    }

    /**
     * Cria um interruptor booleano Sim/Não (Toggle Switch).
     * Envia 'true' ou 'false' para a URL (?filter[key]=true).
     *
     * @param  string  $key  Nome do filtro (ex.: 'is_modular').
     * @param  string  $label  Rótulo do filtro (ex.: 'Apenas Cursos Modulares').
     */
    public static function toggle(string $key, string $label): static
    {
        return new static($key, $label, 'toggle');
    }

    /**
     * Cria um seletor de intervalo de datas (Date Range Picker).
     * Envia o intervalo separado por vírgula (?filter[key]=2026-01-01,2026-02-01).
     *
     * @param  string  $key  Nome do filtro (ex.: 'created_at').
     * @param  string  $label  Rótulo do filtro (ex.: 'Data de Cadastro').
     */
    public static function dateRange(string $key, string $label): static
    {
        return new static($key, $label, 'date-range');
    }

    /**
     * Define as opções selecionáveis para filtros do tipo 'select', 'checkbox' e 'radio'.
     *
     * Aceita dois formatos de entrada:
     * 1. Array associativo chave => valor (padrão idiomático do PHP):
     *    `->options(['draft' => 'Rascunho', 'active' => 'Ativo'])`
     *
     * 2. Lista de objetos pré-formatada (se já vier de banco/resource):
     *    `->options([['value' => 'draft', 'label' => 'Rascunho'], ...])`
     *
     * O método normaliza internamente qualquer formato de entrada para a lista
     * de objetos `[ ['value' => '...', 'label' => '...'] ]` que o TypeScript do Vue exige.
     *
     * @param  array<string|int, string|array{value: string, label: string}>  $options
     */
    public function options(array $options): static
    {
        $this->options = collect($options)
            ->map(function ($item, $key): array {
                // Se já estiver no formato ['value' => ..., 'label' => ...], preserva intacto
                if (is_array($item) && isset($item['value'], $item['label'])) {
                    return [
                        'value' => (string) $item['value'],
                        'label' => (string) $item['label'],
                    ];
                }

                // Se for array associativo chave => valor, converte para o formato do frontend
                return [
                    'value' => (string) $key,
                    'label' => (string) $item,
                ];
            })
            ->values()
            ->all();

        return $this;
    }

    /**
     * Habilita ou desabilita seleção múltipla (aplicável a filtros do tipo 'select').
     */
    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;

        return $this;
    }

    /**
     * Retorna a chave do filtro.
     */
    public function getKey(): string
    {
        return $this->key;
    }

    /**
     * Converte o filtro para a estrutura esperada pelo frontend Vue (DataViewerConfig.filters).
     *
     * @return array{key: string, label: string, type: string, options?: array<int, array{value: string, label: string}>, multiple?: bool}
     */
    public function toArray(): array
    {
        $data = [
            'key' => $this->key,
            'label' => $this->label,
            'type' => $this->type,
        ];

        if (! empty($this->options)) {
            $data['options'] = $this->options;
        }

        if ($this->type === 'select') {
            $data['multiple'] = $this->multiple;
        }

        return $data;
    }

    /**
     * @return array{key: string, label: string, type: string, options?: array<int, array{value: string, label: string}>, multiple?: bool}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
