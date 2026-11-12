Preciso criar um "contrato" no PHP para construção do componente DataViewer, porque como ele funciona como tabela e como grid, e o grid tem todas as funções que a tabela vai ter, é replicação do contrato para ambos as partes do componente.

1. Definir features:
   · [x] ordenação;
   · [x] filtros:
   · [x] selects;
   · [x] dates (ranges);
   · [x] checkbox;
   · [x] toggle;
   · [x] ocultação de colunas (servirá para os campos nos cards);
   · [x] pesquisa (whereFullText);
   · [x] ação em massa (checkbox liberado pelo slot `#bulk-actions`);

2. Definir o contrato para filtros
   Eu preciso criar um builder/fluent para gerar os filtros, ou individualmente ou por grupo, creio que individualmente é melhor. O Filter::make() tem que definir o tipo (definidos acima). Só que nesse sentido eu quase estou querendo copiar o que o Filament faz só que ao invés de livewire, vou usar Vue. Nesse sentido também tenho que criar os Builders/Fluents para cada campo que estou apresentando.
   DataViewer
   ├── fields
   ├── filters
   ├── search
   ├── sorting
   ├── selection
   ├── actions
   └── presentation
   ├── table
   └── grid

---

## Próximos Passos e Melhorias (TODO)

### 1. Filtros e Navegação

- [x] Mudar filtros para Dropdown Popover ou visualização Inline à mostra na Toolbar (remover drawer).
- [x] Tornar filtros 100% opcionais no backend (entidade sem filtros não quebra nem gera botão inútil).
- [x] Adicionar barra de indicadores (chips/badges) de filtros ativos com botão de remoção rápida.
- [x] Flexibilizar `dateRange` para aceitar seleção a partir de data inicial sem obrigar data final, e permitir mesmo dia para data única.

### 2. Apresentação e Tipos de Coluna

- [x] Ajustar formatação de valores no `CourseIndexViewModel` (exibir labels amigáveis e badges em vez de `active` e `true`).
- [ ] Melhorar a descrição no `DataViewerFooter` (ex: "Exibindo de 1 a 15 de 42 registros").

### 3. Layout e Usabilidade

- [ ] Reposicionar o checkbox no card (Grid) para o canto superior esquerdo.
- [ ] Ocultar o botão "Colunas" se nenhuma coluna puder ser escondida (`hideable === false`).
- [ ] Harmonizar tema Shadcn com a identidade visual da landing page (aumentar tipografia e espaçamentos).

### 4. Arquitetura Backend

- [ ] Avaliar substituição de `TableQueryInterface` por classe abstrata base (`TableQuery`) com valores default para `searchableColumns()` e `filters()`.
