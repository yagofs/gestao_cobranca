import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../drawer';

describe('Drawer', () => { 
  it('renderiza Drawer com título após ser aberto', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger>Abrir</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Meu Drawer</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );

    const openButton = screen.getByRole('button', { name: /abrir/i });
    
    // Esta linha precisa do "async" lá em cima para funcionar
    await user.click(openButton); 
    
    // A linha abaixo também precisa do "async"
    expect(await screen.findByText('Meu Drawer')).toBeInTheDocument();
    // FIM DO SEU CÓDIGO
    // =======================================================
  });
});