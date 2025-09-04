import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Button } from '../button';

describe('DropdownMenu', () => {
  it('deve exibir o menu de opções ao clicar no gatilho', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Abrir Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.queryByText('Perfil')).not.toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: /abrir menu/i });
    await user.click(trigger);

    expect(await screen.findByText('Perfil')).toBeVisible();
    expect(screen.getByText('Sair')).toBeVisible();
  });

  // NOVO TESTE ADICIONADO
  it('deve chamar uma função ao clicar em um item do menu', async () => {
    const user = userEvent.setup();
    const onSelectMock = jest.fn(); // Cria uma função "espiã"

    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Abrir Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelectMock}>Perfil</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Abre o menu
    const trigger = screen.getByRole('button', { name: /abrir menu/i });
    await user.click(trigger);

    // Encontra e clica no item
    const menuItem = await screen.findByText('Perfil');
    await user.click(menuItem);

    // Verifica se a função foi chamada
    expect(onSelectMock).toHaveBeenCalledTimes(1);
  });
});