Resumo das alterações (linguagem simples)

O que foi criado

- Criei testes automáticos (chamados "testes unitários") para todas as páginas dentro da pasta `src/pages`.
- Os novos testes ficam em `src/pages/__tests__/` e cobrem as seguintes páginas:
  - `Register.tsx` -> `Register.test.tsx`
  - `NotFound.tsx` -> `NotFound.test.tsx`
  - `Login.tsx` -> `Login.test.tsx`
  - `Index.tsx` -> `Index.test.tsx`
  - `Dashboard.tsx` -> `Dashboard.test.tsx`
  - `Contracts.tsx` -> `Contracts.test.tsx`
  - `ActionHistory.tsx` -> `ActionHistory.test.tsx`
  - `ActionConfirmation.tsx` -> `ActionConfirmation.test.tsx`

O que os testes fazem (explicação simples)

- Eles abrem virtualmente cada página como se fosse o navegador.
- Para funções que falam com o servidor (por exemplo `axios` ou `fetch`) eu criei versões falsas chamadas "mocks" — isso impede que os testes realmente toquem seu servidor local.
- Os testes verificam coisas básicas: se a página mostra o título esperado, se ela chama as funções de rede, e se toma as ações esperadas (por exemplo, navegar para outra página quando o login é bem-sucedido).

Como rodar os testes

- Rode `npm test` na pasta do projeto. O comando já está configurado para usar o Jest.
- O Jest também gera um relatório de "cobertura" (coverage) em `coverage/` mostrando quantas linhas do código foram testadas.

Notas técnicas importantes

- Eu usei bibliotecas que já existem no projeto (Jest e @testing-library/react) para criar esses testes.
- Os arquivos de teste usam 'mocks' para simular respostas do servidor. Isso faz com que os testes sejam rápidos e previsíveis.
- Os testes não alteram seu código de produção; só adicionam arquivos novos na pasta `src/pages/__tests__/`.

Arquivos adicionados/modificados

- Adicionados: 8 arquivos de teste (um por página) e `TESTS_ADDED.md` com esta documentação.
- Modificados: ajustes pontuais nos próprios testes para melhorar confiabilidade (pequenas mudanças nos testes para garantir que o token esteja presente quando necessário).

Se quiser, posso:
- Adicionar tipos de teste para remover avisos no TypeScript (por exemplo `@types/jest`).
- Ajustar os testes para rodarem isolados (ex.: rodar apenas os testes de `pages`).
- Aumentar a cobertura adicionando testes para os componentes UI que hoje não estão cobertos.

---
Ficou alguma dúvida? Posso rodar os testes de novo e subir a cobertura até o máximo possível conforme sua meta.
