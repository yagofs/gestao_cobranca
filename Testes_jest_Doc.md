## Testes Unitários com Jest (React/TypeScript)

Resumo das alterações

O que foi criado

- Testes automáticos (chamados "testes unitários") para todas as páginas dentro da pasta `src/pages`.
- Os novos testes ficam em `src/pages/__tests__/` e cobrem as seguintes páginas:
  - `Register.tsx` -> `Register.test.tsx`
  - `NotFound.tsx` -> `NotFound.test.tsx`
  - `Login.tsx` -> `Login.test.tsx`
  - `Index.tsx` -> `Index.test.tsx`
  - `Dashboard.tsx` -> `Dashboard.test.tsx`
  - `Contracts.tsx` -> `Contracts.test.tsx`
  - `ActionHistory.tsx` -> `ActionHistory.test.tsx`
  - `ActionConfirmation.tsx` -> `ActionConfirmation.test.tsx`

Ambiente e configuração

- Ambiente: `jsdom` (simula o navegador) conforme `jest.config.cjs`.
- Transformação: `babel-jest` para `.ts/.tsx` (TypeScript + JSX).
- Aliases: caminho `@/` apontando para `src/` (via `moduleNameMapper`).
- Setup: `jest.setup.ts` com mocks de `ResizeObserver` e `window.matchMedia` e `@testing-library/jest-dom`.
- Cobertura: habilitada (`collectCoverage: true`) para `src/**/*.{js,jsx,ts,tsx}`; relatórios em `coverage/` (lcov + texto no terminal).

O que os testes fazem

- Eles abrem virtualmente cada página como se fosse o navegador.
- Para funções que falam com o servidor (por exemplo `axios` ou `fetch`) eu criei versões falsas chamadas "mocks" — isso impede que os testes realmente toquem seu servidor local.
- Os testes verificam coisas básicas: se a página mostra o título esperado, se ela chama as funções de rede, e se toma as ações esperadas (por exemplo, navegar para outra página quando o login é bem-sucedido).

Como rodar os testes (PowerShell no Windows)

```powershell
# Rodar todos os testes com cobertura (padrão do projeto)
npm test

# Rodar somente uma suíte específica
npx jest src/pages/__tests__/Login.test.tsx -v

# Rodar testes filtrando por nome (pattern)
npx jest -t "Dashboard" -v

# Rodar em watch mode (reexecuta ao salvar arquivos)
npx jest --watch

# Gerar apenas relatório de cobertura sem executar novamente (se cache existir)
npx jest --coverage --coverageReporters=text --coverageReporters=lcov
```

Relatórios e cobertura

- Resultados de cobertura ficam em `coverage/` (HTML em `coverage/lcov-report/index.html`).
- Integração com CI: o comando `npm test` já gera `lcov` para publicação em ferramentas de qualidade.

## Testes de componentes UI

- `src/components/ui/__tests__/table.test.tsx`: verifica renderização da estrutura da tabela (header/body/caption).
- `src/components/ui/__tests__/menubar.test.tsx`: verifica que o menubar abre ao clicar no trigger e exibe itens.
- `src/components/ui/__tests__/metric-card.test.tsx`: valida título, valor, icon, subtitle e trend.
- `src/components/ui/__tests__/checkbox.test.tsx`: simula clique e verifica callback `onCheckedChange`.
- `src/components/ui/__tests__/label.test.tsx`: garante que o texto passado como children aparece.
- `src/components/ui/__tests__/accordion.test.tsx`: abre/fecha itens do acordeão e renderiza conteúdo interno.
- `src/components/ui/__tests__/alert-dialog.test.tsx`: abre o diálogo de alerta e aciona ações de confirmar/cancelar.
- `src/components/ui/__tests__/alert.test.tsx`: renderiza variantes de alerta e sua mensagem.
- `src/components/ui/__tests__/aspect-ratio.test.tsx`: mantém a proporção do contêiner conforme o ratio definido.
- `src/components/ui/__tests__/avatar.test.tsx`: exibe imagem quando disponível e fallback com iniciais.
- `src/components/ui/__tests__/badge.test.tsx`: renderiza o badge nas variantes e com o texto informado.
- `src/components/ui/__tests__/breadcrumb.test.tsx`: renderiza trilha de navegação e itens clicáveis.
- `src/components/ui/__tests__/button.test.tsx`: renderiza variantes de botão e dispara onClick.
- `src/components/ui/__tests__/calendar.test.tsx`: navega entre meses e seleciona datas.
- `src/components/ui/__tests__/card.test.tsx`: renderiza a estrutura (header, content, footer) do card.
- `src/components/ui/__tests__/collapsible.test.tsx`: alterna visibilidade do conteúdo colapsável.
- `src/components/ui/__tests__/context-menu.test.tsx`: abre menu contextual e exibe opções.
- `src/components/ui/__tests__/dialog.test.tsx`: abre/fecha o diálogo e exibe conteúdo interno.
- `src/components/ui/__tests__/drawer.test.tsx`: abre/fecha o drawer lateral e mantém foco acessível.
- `src/components/ui/__tests__/dropdown-menu.test.tsx`: abre o menu dropdown e permite selecionar itens.
- `src/components/ui/__tests__/hover-card.test.tsx`: exibe cartão ao passar o mouse/foco e oculta ao sair.
- `src/components/ui/__tests__/navigation-menu.test.tsx`: renderiza itens e permite navegação entre seções.
- `src/components/ui/__tests__/pagination.test.tsx`: renderiza controles e troca de página.
- `src/components/ui/__tests__/popover.test.tsx`: abre/fecha o popover e exibe conteúdo.
- `src/components/ui/__tests__/progress.test.tsx`: renderiza progresso até o valor informado.
- `src/components/ui/__tests__/radio-group.test.tsx`: seleciona opções mutuamente exclusivas.
- `src/components/ui/__tests__/resizable.test.tsx`: permite redimensionamento de painéis (eventos simulados).
- `src/components/ui/__tests__/scroll-area.test.tsx`: renderiza área com rolagem conforme overflow.
- `src/components/ui/__tests__/separator.test.tsx`: renderiza separador horizontal/vertical.
- `src/components/ui/__tests__/sheet.test.tsx`: abre/fecha sheet e gerencia foco.
- `src/components/ui/__tests__/sidebar.test.tsx`: alterna a barra lateral e exibe itens.
- `src/components/ui/__tests__/skeleton.test.tsx`: renderiza placeholders de carregamento.
- `src/components/ui/__tests__/slider.test.tsx`: move o handle e emite valores de mudança.
- `src/components/ui/__tests__/sonner.test.tsx`: exibe toasts via API do Sonner.
- `src/components/ui/__tests__/switch.test.tsx`: alterna estado on/off e chama callback.
- `src/components/ui/__tests__/tabs.test.tsx`: muda entre abas por clique/teclado.
- `src/components/ui/__tests__/toast.test.tsx`: renderiza um toast básico e controla fechamento.
- `src/components/ui/__tests__/toggle.test.tsx`: alterna o estado do botão toggle e chama callback.

Todos os testes são unitários e não fazem chamadas externas ao backend.

Boas práticas usadas

- Mocks isolam dependências (ex.: `axios`) e evitam flakiness.
- Testes focam em comportamento visível: títulos, botões, navegação (via mocks de `react-router-dom`).
- `@testing-library/react` prioriza queries por papel/nome acessível (`getByRole`, `getByText`), alinhando com acessibilidade.
