import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../context-menu';

describe('ContextMenu', () => {
  it('deve exibir o menu de opções ao clicar com o botão direito', async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Clique com o botão direito aqui</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Perfil</ContextMenuItem>
          <ContextMenuItem>Copiar</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    // Verifica se os itens do menu estão inicialmente ocultos
    expect(screen.queryByText('Perfil')).not.toBeInTheDocument();

    // Encontra o gatilho e simula o clique com o botão direito
    const trigger = screen.getByText('Clique com o botão direito aqui');
    await user.pointer({ keys: '[MouseRight]', target: trigger });

    // Verifica se os itens do menu agora estão visíveis
    expect(await screen.findByText('Perfil')).toBeVisible();
    expect(screen.getByText('Copiar')).toBeVisible();
  });
});