import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '../dialog'; // Verifique se o caminho do import está correto
import { Button } from '../button';

describe('Dialog', () => {
  it('deve exibir o conteúdo do diálogo quando o gatilho é clicado', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Abrir Diálogo</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título do Diálogo</DialogTitle>
            <DialogDescription>
              Esta é a descrição do diálogo.
            </DialogDescription>
          </DialogHeader>
          <p>Corpo do diálogo aqui.</p>
          <DialogFooter>
            <Button>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // 1. Verifique se o conteúdo está inicialmente oculto
    expect(screen.queryByText('Título do Diálogo')).not.toBeInTheDocument();

    // 2. Encontre e clique no botão para abrir o diálogo
    const triggerButton = screen.getByRole('button', { name: /abrir diálogo/i });
    await user.click(triggerButton);

    // 3. Verifique se o título, a descrição e o corpo agora estão visíveis
    expect(await screen.findByText('Título do Diálogo')).toBeInTheDocument();
    expect(screen.getByText('Esta é a descrição do diálogo.')).toBeInTheDocument();
    expect(screen.getByText('Corpo do diálogo aqui.')).toBeInTheDocument();
  });
});