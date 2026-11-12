# @manadah/data-viewer

DataViewer para Vue 3 + Inertia/Laravel: listagem em tabela ou grid com busca, filtros, ordenação, seleção/ações em massa e paginação.

Instalado como código-fonte (SFC + TS): o Vite do projeto compila o pacote, o que permite customização total de tema e classes.

## Requisitos

- Vue >= 3.5, Tailwind CSS >= 4
- Projeto shadcn-vue com as variáveis de tema padrão (`--border`, `--primary`, `--muted-foreground`...)
- `reka-ui`, `@vueuse/core`, `vue-sonner` (peers)
- `@inertiajs/vue3` apenas se usar o provider Inertia (opcional)

## Configuração

```ts
// vite.config.ts
export default defineConfig({
    optimizeDeps: { exclude: ['@manadah/data-viewer'] },
});
```

```css
/* resources/css/app.css */
@source '../../node_modules/@manadah/data-viewer/src';
```

## Registrando o provider (Inertia)

```ts
// app.ts
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { DataViewerPlugin, createInertiaProvider } from '@manadah/data-viewer/inertia';

void createInertiaApp({
    title: (title) => (title ? `${title} - App` : 'App'),
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(DataViewerPlugin, { provider: createInertiaProvider({ mode: 'page' }) })
            .mount(el);
    },
});
```

Sem o plugin, o DataViewer usa o provider `fetch`, que consome endpoints JSON no formato do paginator do Laravel.

## `<DataViewer>`

```vue
<script setup lang="ts">
import { DataViewer } from '@manadah/data-viewer';
import type { DataViewerConfig, Paginated } from '@manadah/data-viewer';

defineProps<{
    config: DataViewerConfig;
    data: Paginated<Curso>;
    only?: string[];
}>();
</script>

<template>
    <DataViewer :config="config" :data="data" :only="only">
        <template #nome="{ value }">{{ value }}</template>

        <template #status="{ item }">
            <Badge variant="secondary">{{ item.status.name }}</Badge>
        </template>

        <template #card-footer="{ item }">
            <Link :href="route('cursos.show', item.ulid)">Abrir</Link>
        </template>

        <template #bulk-actions="{ count, payload, clear }">
            <Button @click="excluir(payload)">Excluir {{ count }}</Button>
            <Button variant="ghost" @click="clear">Limpar</Button>
        </template>
    </DataViewer>
</template>
```

### Props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `config` | `DataViewerConfig` | — | colunas, filtros, rowKey, `recordUrlKey`, `perPageOptions`, `filterDisplay`, `storageKey` |
| `data` | `Paginated<T>` | — | paginador do Laravel (props do Inertia) |
| `url` | `string` | `window.location.pathname` | URL de busca |
| `only` | `string[]` | — | props parciais do Inertia |
| `storageKey` | `string` | `'data-viewer'` | chave de localStorage (view, colunas, larguras) |
| `defaultViewMode` | `'table' \| 'grid'` | `'table'` | |
| `provider` | `DataViewerProvider` | plugin ou `fetch` | fonte de dados |
| `navigate` | `(url: string) => void` | provider ou `location.assign` | clique em linha/card |
| `labels` | `Partial<DataViewerLabels>` | — | sobrescreve textos do componente |

### Slots

| Slot | Props |
|---|---|
| nome da coluna (`#status`, `#nome`) | `{ item, row, value }` |
| `card` | `{ item, row, selection, isSelected }` |
| `card-header` | `{ item, row }` |
| `card-content` | `{ item, row }` |
| `card-footer` | `{ item, row }` |
| `bulk-actions` | `{ count, payload, clear }` |

### Tipos

```ts
type Column = {
    key: string;
    label: string;
    sortable?: boolean;
    hideable?: boolean;
    hidden?: boolean;
};

type Filter =
    | { type: 'select'; key: string; label: string; options: FilterOption[]; multiple?: boolean }
    | { type: 'checkbox'; key: string; label: string; options: FilterOption[] }
    | { type: 'radio'; key: string; label: string; options: FilterOption[] }
    | { type: 'toggle'; key: string; label: string }
    | { type: 'date-range'; key: string; label: string };

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};
```

## Células

```vue
<script setup lang="ts">
import {
    TableTextCell,
    TableBadgeCell,
    TableDateCell,
    TableMoneyCell,
    TableAvatarCell,
    TableIconCell,
    TableProgressCell,
    TableActionsCell,
} from '@manadah/data-viewer';
</script>

<template>
    <TableTextCell :value="row.name" copyable clamp />
    <TableBadgeCell :value="row.status" :map="{ active: { label: 'Ativo', variant: 'default' } }" />
    <TableDateCell :value="row.created_at" format="datetime" show-relative-tooltip />
    <TableMoneyCell :value="row.price" currency="BRL" />
    <TableAvatarCell :src="row.avatar_url" :name="row.name" />
    <TableIconCell :value="row.active" />
    <TableProgressCell :value="row.progress" />
    <TableActionsCell :align="end">
        <Button>Editar</Button>
    </TableActionsCell>
</template>
```

## Providers

```ts
import { createFetchProvider } from '@manadah/data-viewer';

// API customizada
const provider = createFetchProvider({
    headers: { Authorization: `Bearer ${token}` },
    buildUrl: ({ url, params }) => `${url}?${new URLSearchParams(params as any)}`,
});

app.use(DataViewerPlugin, { provider });
```

Interface mínima:

```ts
interface DataViewerProvider {
    submit(request: { url, params, append, only? }, callbacks: { onStart?, onSuccess?, onFinish?, onError? }): void;
    navigate?(url: string): void;
}
```

## Textos

Os rótulos padrão (PT-BR) ficam em `defaultLabels` e podem ser substituídos por `labels` no plugin ou na prop:

```ts
app.use(DataViewerPlugin, { labels: { table: 'Lista', cards: 'Cartões', loadMore: 'Ver mais' } });
```
