<?php

declare(strict_types=1);

namespace Manadah\DataViewer;

use Illuminate\Contracts\Support\Arrayable;
use JsonSerializable;

/**
 * Construtor fluente para definição de colunas da tabela/grid.
 *
 * @implements Arrayable<string, mixed>
 */
class Column implements Arrayable, JsonSerializable
{
    /** Se a coluna permite ordenação ascendente e descendente (asc/desc). */
    protected bool $sortable = false;

    /** Se o usuário pode alternar a visibilidade desta coluna no menu "Colunas". */
    protected bool $hideable = true;

    /** Se a coluna deve iniciar oculta por padrão na primeira renderização. */
    protected bool $hidden = false;

    /**
     * @param  string  $key  Identificador da coluna no banco/DTO (ex.: 'name', 'status').
     * @param  string  $label  Rótulo legível exibido no cabeçalho (ex.: 'Nome do Curso').
     */
    public function __construct(
        protected string $key,
        protected string $label,
    ) {}

    public static function make(string $key, string $label): static
    {
        return new static($key, $label);
    }

    public function sortable(bool $sortable = true): static
    {
        $this->sortable = $sortable;

        return $this;
    }

    public function hideable(bool $hideable = true): static
    {
        $this->hideable = $hideable;

        return $this;
    }

    public function hidden(bool $hidden = true): static
    {
        $this->hidden = $hidden;

        return $this;
    }

    public function getKey(): string
    {
        return $this->key;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getSortable(): bool
    {
        return $this->sortable;
    }

    /**
     * @return array{key: string, label: string, sortable: bool, hideable: bool, hidden: bool}
     */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'sortable' => $this->sortable,
            'hideable' => $this->hideable,
            'hidden' => $this->hidden,
        ];
    }

    /**
     * @return array{key: string, label: string, sortable: bool, hideable: bool, hidden: bool}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
