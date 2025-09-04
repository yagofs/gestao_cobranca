import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../toggle';
import { Bold } from 'lucide-react'; // Exemplo com um ícone

describe('Toggle', () => {
  it('deve renderizar com o estado "não pressionado" por padrão', () => {
    render(
      <Toggle aria-label="Toggle negrito">
        <Bold />
      </Toggle>
    );
    const toggleButton = screen.getByRole('button', { name: 'Toggle negrito' });
    // O estado de um toggle é verificado pelo atributo aria-pressed
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('deve alternar para o estado "pressionado" após o clique', async () => {
    const user = userEvent.setup();
    render(
      <Toggle aria-label="Toggle negrito">
        <Bold />
      </Toggle>
    );
    const toggleButton = screen.getByRole('button', { name: 'Toggle negrito' });

    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
  });
});