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

O que os testes fazem

- Eles abrem virtualmente cada página como se fosse o navegador.
- Para funções que falam com o servidor (por exemplo `axios` ou `fetch`) eu criei versões falsas chamadas "mocks" — isso impede que os testes realmente toquem seu servidor local.
- Os testes verificam coisas básicas: se a página mostra o título esperado, se ela chama as funções de rede, e se toma as ações esperadas (por exemplo, navegar para outra página quando o login é bem-sucedido).

Como rodar os testes

- Rode `npm test` na pasta do projeto. O comando já está configurado para usar o Jest.
- O Jest também gera um relatório de "cobertura" (coverage) em `coverage/` mostrando quantas linhas do código foram testadas.

## Testes de componentes UI

- `src/components/ui/__tests__/table.test.tsx`: verifica renderização da estrutura da tabela (header/body/caption).
- `src/components/ui/__tests__/menubar.test.tsx`: verifica que o menubar abre ao clicar no trigger e exibe itens.
- `src/components/ui/__tests__/metric-card.test.tsx`: valida título, valor, icon, subtitle e trend.
- `src/components/ui/__tests__/checkbox.test.tsx`: simula clique e verifica callback `onCheckedChange`.
- `src/components/ui/__tests__/label.test.tsx`: garante que o texto passado como children aparece.

Todos os testes são unitários e não fazem chamadas externas ao backend.
