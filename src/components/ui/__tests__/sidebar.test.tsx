import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarRail, // Adicionada importação
} from '../sidebar';
import { SheetTitle, SheetDescription } from '../sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home } from 'lucide-react';

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    (useIsMobile as jest.Mock).mockClear();
  });

  describe('quando em visão de desktop', () => {
    beforeEach(() => { (useIsMobile as jest.Mock).mockReturnValue(false); });
    it('deve renderizar a sidebar e os itens de menu', () => {
      render(<SidebarProvider><Sidebar><SidebarContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton>Dashboard</SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarContent></Sidebar></SidebarProvider>);
      const sidebarElement = screen.getByTestId('sidebar-container');
      expect(sidebarElement).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    });
    it('deve alternar entre os estados "expanded" e "collapsed" ao clicar no trigger', async () => {
      const user = userEvent.setup();
      render(<SidebarProvider><Sidebar /><SidebarTrigger /></SidebarProvider>);
      const sidebarContainer = screen.getByTestId('sidebar-container');
      expect(sidebarContainer).toHaveAttribute('data-state', 'expanded');
      const triggerButton = screen.getByRole('button', { name: /toggle sidebar/i });
      await user.click(triggerButton);
      expect(sidebarContainer).toHaveAttribute('data-state', 'collapsed');
      await user.click(triggerButton);
      expect(sidebarContainer).toHaveAttribute('data-state', 'expanded');
    });
  });

  describe('quando em visão de mobile', () => {
    beforeEach(() => { (useIsMobile as jest.Mock).mockReturnValue(true); });
    it('deve exibir o conteúdo da sidebar ao clicar no trigger e não gerar avisos', async () => {
      const user = userEvent.setup();
      render(<SidebarProvider><Sidebar><SidebarHeader><SheetTitle>Menu Principal</SheetTitle><SheetDescription>Navegue pelas seções do sistema.</SheetDescription></SidebarHeader><SidebarContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton>Dashboard</SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarContent></Sidebar><SidebarTrigger /></SidebarProvider>);
      const triggerButton = screen.getByRole('button', { name: /toggle sidebar/i });
      await user.click(triggerButton);
      const dashboardButton = await screen.findByRole('button', { name: /dashboard/i });
      expect(dashboardButton).toBeInTheDocument();
    });
  });

  describe('interações avançadas', () => {
    beforeEach(() => {
      (useIsMobile as jest.Mock).mockReturnValue(false);
    });

    it('deve alternar o estado com o atalho de teclado (Ctrl+B)', async () => {
      const user = userEvent.setup();
      render(<SidebarProvider><Sidebar /></SidebarProvider>);
      const sidebarContainer = screen.getByTestId('sidebar-container');
      expect(sidebarContainer).toHaveAttribute('data-state', 'expanded');
      await user.keyboard('{Control>}b{/Control}');
      expect(sidebarContainer).toHaveAttribute('data-state', 'collapsed');
    });

    it('deve mostrar e esconder um tooltip ao pressionar Escape', async () => {
      const user = userEvent.setup();
      render(
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Ir para o Início">
                    <Home />
                    <span>Início</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarTrigger />
        </SidebarProvider>
      );
      const triggerButton = screen.getByRole('button', { name: /toggle sidebar/i });
      await user.click(triggerButton);
      const menuButton = screen.getByRole('button', { name: /início/i });
      await user.hover(menuButton);
      const tooltip = await screen.findByRole('tooltip', { name: /ir para o início/i });
      const tooltipContentWrapper = tooltip.parentElement;
      expect(tooltipContentWrapper).not.toHaveAttribute('data-state', 'closed');
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(tooltipContentWrapper).toHaveAttribute('data-state', 'closed');
      });
    });

    // NOVO TESTE ADICIONADO
    it('deve alternar o estado ao clicar no SidebarRail', async () => {
      const user = userEvent.setup();
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarRail />
          </Sidebar>
        </SidebarProvider>
      );
      const sidebarContainer = screen.getByTestId('sidebar-container');
      expect(sidebarContainer).toHaveAttribute('data-state', 'expanded');
    
      // O Rail tem o mesmo nome de acessibilidade do Trigger
      const railButtons = screen.getAllByRole('button', { name: /toggle sidebar/i });
      // Assumimos que o rail é o primeiro botão com esse nome no DOM. Se falhar, podemos ajustar o seletor.
      const railButton = railButtons[0];
      await user.click(railButton);
    
      expect(sidebarContainer).toHaveAttribute('data-state', 'collapsed');
    });
  });
});