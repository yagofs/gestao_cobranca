// Testes unitários para o componente Menubar (Radix)
// - Objetivo: garantir que a estrutura básica do menu renderiza e que
//   ao clicar no trigger, o conteúdo (itens) aparece.
// - Observação: usa primitives do Radix e não faz chamadas externas.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Menubar, MenubarTrigger, MenubarContent, MenubarItem, MenubarMenu } from '../menubar';
import userEvent from '@testing-library/user-event';

describe('Menubar component', () => {
  test('renderiza trigger e conteúdo básico', async () => {
    const user = userEvent.setup();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Menu</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Item A</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    const trigger = screen.getByText('Menu');
    expect(trigger).toBeInTheDocument();
    // abrir o menu
    await user.click(trigger);
    expect(await screen.findByText('Item A')).toBeInTheDocument();
  });
});
