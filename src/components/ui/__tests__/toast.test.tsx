import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useToast } from '../use-toast';
import { Toaster } from '../toaster';
import { Button } from '../button';
import { ToastAction } from '../toast';

const ToastTestComponent = () => {
  const { toast } = useToast();

  return (
    <div>
      <Toaster />

      <Button
        onClick={() => {
          toast({
            title: 'Agendado',
            description: 'Sua reunião foi agendada para sexta-feira.',
            action: <ToastAction altText="DesfazerAcao">Desfazer</ToastAction>,
          });
        }}
      >
        Disparar Toast Padrão
      </Button>

      <Button
        onClick={() => {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Algo deu errado.',
          });
        }}
      >
        Disparar Toast Destrutivo
      </Button>
    </div>
  );
};

describe('Sistema de Toast', () => {
  it('deve renderizar o título e a descrição ao ser disparado', async () => {
    const user = userEvent.setup();
    render(<ToastTestComponent />);

    const triggerButton = screen.getByRole('button', { name: 'Disparar Toast Padrão' });
    await user.click(triggerButton);

    expect(await screen.findByText('Agendado')).toBeInTheDocument();
    expect(await screen.findByText('Sua reunião foi agendada para sexta-feira.')).toBeInTheDocument();
  });

  it('deve aplicar a classe da variante "destructive" ao ser disparado', async () => {
    const user = userEvent.setup();
    render(<ToastTestComponent />);

    const triggerButton = screen.getByRole('button', { name: 'Disparar Toast Destrutivo' });
    await user.click(triggerButton);

    const toastTitle = await screen.findByText('Erro');
    const toastElement = toastTitle.closest('li');
    expect(toastElement).toHaveClass('destructive');
  });

  it('deve renderizar a ToastAction (botão de ação)', async () => {
    const user = userEvent.setup();
    render(<ToastTestComponent />);

    const triggerButton = screen.getByRole('button', { name: 'Disparar Toast Padrão' });
    await user.click(triggerButton);

    // CORREÇÃO AQUI: Procuramos pelo texto visível do botão, "Desfazer".
    const actionButton = await screen.findByRole('button', { name: 'Desfazer' });
    
    expect(actionButton).toBeInTheDocument();
  });
});