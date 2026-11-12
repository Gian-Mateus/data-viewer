# manadah/data-viewer

DataViewer para **Vue 3 + Inertia/Laravel**: componente de listagem em **tabela** ou **grid** com busca, filtros, ordenação, seleção/ações em massa e paginação, mais o **contrato PHP** que gera a configuração do frontend.

Originado do projeto `akademos-saas` (branch `refact-inertia`) e extraído como pacote reutilizável.

## Estrutura

```
manadah-data-viewer/
├── packages/
│   ├── vue/        # @manadah/data-viewer  (npm, código-fonte SFC + TS)
│   └── laravel/    # manadah/data-viewer   (Composer, contrato TableQuery)
└── .github/workflows/
    ├── ci.yml              # testes dos dois pacotes
    ├── publish-npm.yml     # publica no GitHub Packages (tags vue-v*)
    └── split-laravel.yml   # subtree split de packages/laravel
```

## Instalação no frontend

```bash
npm install @manadah/data-viewer
```

Com GitHub Packages, configure o `.npmrc` do projeto:

```ini
@manadah:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GH_TOKEN}
```

### Vite

O pacote é distribuído como código-fonte (`.vue`/`.ts`), então o Vite precisa transpilá-lo:

```ts
// vite.config.ts
export default defineConfig({
    optimizeDeps: {
        exclude: ['@manadah/data-viewer'],
    },
});
```

### Tailwind

Garanta que o Tailwind escaneie as classes do pacote (em `resources/css/app.css`):

```css
@source '../../node_modules/@manadah/data-viewer/src';
```

As classes usam as variáveis de tema padrão do shadcn/Tailwind v4 (`border`, `primary`, `muted-foreground` etc.), então o pacote já herda a identidade visual do projeto.

## Uso

```vue
<script setup lang="ts">
import { DataViewer } from '@manadah/data-viewer';
import type { DataViewerConfig, Paginated } from '@manadah/data-viewer';

defineProps<{ config: DataViewerConfig; data: Paginated<Curso> }>();
</script>

<template>
    <DataViewer :config="config" :data="data">
        <template #nome="{ value }">{{ value }}</template>
        <template #bulk-actions="{ count, payload }">
            <button @click="excluir(payload)">Excluir {{ count }}</button>
        </template>
    </DataViewer>
</template>
```

Com Inertia (provider nativo, mantém o Inertia opcional para quem não usa):

```ts
// app.ts
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { DataViewerPlugin, createInertiaProvider } from '@manadah/data-viewer/inertia';

void createInertiaApp({
    title: (t) => (t ? `${t} - App` : 'App'),
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(DataViewerPlugin, { provider: createInertiaProvider({ mode: 'page' }) })
            .mount(el);
    },
});
```

Sem Inertia, o `<DataViewer>` já usa o provider `fetch` por padrão e espera um endpoint JSON com o paginador do Laravel.

## Textos

Todos os rótulos (PT-BR por padrão) podem ser sobrescritos globalmente no plugin ou por instância:

```ts
app.use(DataViewerPlugin, { labels: { table: 'Lista', loadMore: 'Ver mais' } });
```

```vue
<DataViewer :config="config" :data="data" :labels="{ cards: 'Cartões' }" />
```

## Consumindo localmente (antes de publicar)

Enquanto o pacote não estiver no GitHub Packages, gere o tarball e instale no projeto consumidor:

```bash
cd packages/vue && npm pack
# no projeto consumidor
npm install ../manadah-data-viewer/packages/vue/manadah-data-viewer-0.1.0.tgz
```

> Prefira o tarball a `file:` com o diretório do pacote. O `file:` cria um symlink e o TypeScript passa a resolver
> uma segunda cópia do Vue dentro do monorepo, gerando erros de tipos incompatíveis (`App`, `ComponentPublicInstance`).

Depois de publicar, troque a dependência por `"@manadah/data-viewer": "^0.1.0"`.

## Instalação do pacote PHP

O `packages/laravel` é publicado por **subtree split** no repositório `manadah/data-viewer-php`. Nos projetos:

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

```php
use Manadah\DataViewer\TableQuery;
use Manadah\DataViewer\Column;
use Manadah\DataViewer\Filter;

class CourseTableQuery extends TableQuery
{
    public function rowKey(): string { return 'ulid'; }
    public function searchableColumns(): array { return ['name', 'description']; }

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

## Desenvolvimento

```bash
# frontend
pnpm install
pnpm test
pnpm typecheck

# backend
cd packages/laravel && composer install && composer test
```

## Publicação

- **npm**: `pnpm --filter @manadah/data-viewer version <bump>`, ajuste `packages/vue/package.json` e crie a tag `vue-v0.1.0` (o workflow publica no GitHub Packages).
- **Composer**: o split de `packages/laravel` acontece automaticamente ao publicar na `main`.
