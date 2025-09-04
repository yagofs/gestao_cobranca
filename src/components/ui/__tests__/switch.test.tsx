import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../switch'; // Ajuste o caminho se necessário
import { Label } from '../label';

describe('Switch', () => {
  it('deve renderizar no estado desmarcado por padrão', () => {
    render(<Switch id="meu-switch" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('deve alternar para o estado marcado após o clique', async () => {
    const user = userEvent.setup();
    render(<Switch id="meu-switch" />);
    const switchElement = screen.getByRole('switch');

    // Verifica o estado inicial
    expect(switchElement).not.toBeChecked();

    // Simula o clique
    await user.click(switchElement);

    // Verifica se o estado mudou
    expect(switchElement).toBeChecked();
  });

  it('deve ser acessível através de um Label associado', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="meu-switch">Ligar modo avião</Label>
        <Switch id="meu-switch" />
      </div>
    );
    const switchElement = screen.getByRole('switch');
    const labelElement = screen.getByText('Ligar modo avião');

    expect(switchElement).not.toBeChecked();

    // Clicar no label deve ativar o switch
    await user.click(labelElement);

    expect(switchElement).toBeChecked();
  });
});