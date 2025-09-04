import { render, screen } from '@testing-library/react';
import { Toaster, toast } from 'sonner';

describe('Toaster (Sonner)', () => {
  it('deve renderizar o contêiner de toasts sem quebrar', () => {
    // Este é um "smoke test" que garante que o componente renderiza sem erros.
    const { container } = render(<Toaster />);
    expect(container).toBeInTheDocument();
  });

  it('deve exibir uma notificação quando a função toast é chamada', async () => {
    render(<Toaster />);

    // Dispara uma notificação programaticamente
    toast('Minha notificação de teste');

    // Verifica se o texto da notificação aparece na tela.
    // Usamos `findByText` para esperar a notificação aparecer, pois pode haver animações.
    const toastElement = await screen.findByText('Minha notificação de teste');
    expect(toastElement).toBeInTheDocument();
  });
});