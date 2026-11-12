# manadah/data-viewer

DataViewer para **Laravel + Vue 3 + Inertia**: listagem em tabela ou grid com busca, filtros, ordenação, seleção/ações em massa e paginação.

É **um único pacote Composer**. Ele entrega:

- o contrato PHP (`TableQuery`, `Column`, `Filter`) construído sobre o `spatie/laravel-query-builder`;
- o código-fonte Vue (`.vue` + `.ts`), publicado no projeto com `vendor:publish`.

Não existe pacote npm nem `node_modules/@manadah/data-viewer`. Os arquivos Vue passam a pertencer ao projeto e podem ser editados livremente.

## Estrutura

```
manadah-data-viewer/
├── packages/laravel/
│   ├── src/                       # contrato PHP + DataViewerServiceProvider
│   ├── resources/js/data-viewer/  # fonte Vue publicada no projeto
│   └── tests/                     # PHPUnit + Vitest
├── dev/                           # shadcn de desenvolvimento (não publicado)
└── .github/workflows/
    ├── ci.yml
    └── split-laravel.yml          # subtree split para manadah/data-viewer-php
```

## Instalação

Enquanto o pacote não estiver no Packagist, use um repositório VCS:

```json
{
    "repositories": [
        { "type": "vcs", "url": "git@github.com:manadah/data-viewer-php.git" }
    ],
    "require": {
        "manadah/data-viewer": "^0.1"
    }
}
```

```bash
composer update manadah/data-viewer
php artisan vendor:publish --tag=data-viewer-vue
```

Os arquivos são copiados para `resources/js/components/data-viewer/`. A partir daí são código do projeto: edite, mova ou renomeie como quiser.

## Primitivos shadcn

O DataViewer usa os componentes do próprio projeto (`@/components/ui/*` e `@/lib/utils`). Ele precisa destes primitivos:

```
avatar badge button card checkbox dialog dropdown-menu input input-group
label pagination popover range-calendar select separator switch table textarea tooltip
```

Se faltar algum:

```bash
npx shadcn-vue@latest add avatar badge button card checkbox dialog dropdown-menu input input-group label pagination popover range-calendar select separator switch table textarea tooltip
```

O pacote assume os aliases padrão do shadcn-vue (`@/components/ui` e `@/lib/utils`). Se o projeto usar outros, ajuste os imports após publicar.

## Uso

```vue
<script setup lang="ts">
import { DataViewer } from '@/components/data-viewer';
import type { DataViewerConfig, Paginated } from '@/components/data-viewer';

defineProps<{ config: DataViewerConfig; data: Paginated<Curso> }>();
</script>

<template>
    <DataViewer :config="config" :data="data">
        <template #nome="{ value }">{{ value }}</template>

        <template #bulk-actions="{ count, payload, clear }">
            <button @click="excluir(payload)">Excluir {{ count }}</button>
            <button @click="clear">Limpar</button>
        </template>
    </DataViewer>
</template>
```

A seleção existe **apenas quando o slot `#bulk-actions` é fornecido**. Sem o slot, nenhum checkbox é renderizado.

## Inertia

```ts
// resources/js/app.ts
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { DataViewerPlugin, createInertiaProvider } from '@/components/data-viewer/inertia';

void createInertiaApp({
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(DataViewerPlugin, { provider: createInertiaProvider() })
            .mount(el!);
    },
});
```

Sem Inertia, o componente usa o provider `fetch` por padrão.

## Contrato PHP

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
        return ['name'];
    }

    public function columns(): array
    {
        return [
            Column::make('name', 'Nome')->sortable(),
            Column::make('status', 'Situação')->sortable(),
        ];
    }

    public function filters(): array
    {
        return [Filter::select('status', 'Situação')->options(['active' => 'Ativo'])];
    }

    public function query(Builder|Relation|null $baseQuery = null, ?Request $request = null): QueryBuilder
    {
        return QueryBuilder::for($baseQuery ?? Course::query(), $request)
            ->allowedSorts('name', 'status')
            ->defaultSort('name')
            ->allowedFilters(AllowedFilter::exact('status'));
    }
}
```

No controller:

```php
return Inertia::render('gestor/courses/Index', [
    'courses' => $query->query(request: $request)->paginate(perPage: $request->integer('per_page', 15)),
    'config' => $query->config(),
]);
```

## Atualização

```bash
composer update manadah/data-viewer
php artisan vendor:publish --tag=data-viewer-vue --force
```

`--force` sobrescreve os arquivos publicados. Revise o diff antes de commitar, porque o projeto pode ter customizações.

## Desenvolvimento

```bash
# frontend (Vitest + vue-tsc)
pnpm install
pnpm test
pnpm typecheck

# backend
cd packages/laravel && composer install && composer test
```

A pasta `dev/` contém uma cópia dos primitivos shadcn usada só para typecheck e testes do pacote. Ela não é publicada.

## Publicação

O workflow `split-laravel.yml` faz o subtree split de `packages/laravel` para `manadah/data-viewer-php`, que é o repositório consumido pelo Composer.
