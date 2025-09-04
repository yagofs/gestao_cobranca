import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

describe('Tabs', () => {
  it('deve renderizar e exibir o conteúdo da primeira aba por padrão', () => {
    render(
      <Tabs defaultValue="conta">
        <TabsList>
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="senha">Senha</TabsTrigger>
        </TabsList>
        <TabsContent value="conta">Conteúdo da aba Conta.</TabsContent>
        <TabsContent value="senha">Conteúdo da aba Senha.</TabsContent>
      </Tabs>
    );

    // Verifica se o conteúdo da primeira aba está visível
    expect(screen.getByText('Conteúdo da aba Conta.')).toBeVisible();
    
    // CORREÇÃO AQUI: Verifica se o conteúdo da segunda aba NÃO ESTÁ no documento
    expect(screen.queryByText('Conteúdo da aba Senha.')).not.toBeInTheDocument();
  });

  it('deve alternar para a segunda aba e exibir seu conteúdo após o clique', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="conta">
        <TabsList>
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="senha">Senha</TabsTrigger>
        </TabsList>
        <TabsContent value="conta">Conteúdo da aba Conta.</TabsContent>
        <TabsContent value="senha">Conteúdo da aba Senha.</TabsContent>
      </Tabs>
    );

    const senhaTabTrigger = screen.getByRole('tab', { name: 'Senha' });
    await user.click(senhaTabTrigger);

    // Agora, o conteúdo da segunda aba deve estar visível
    expect(screen.getByText('Conteúdo da aba Senha.')).toBeVisible();
    
    // CORREÇÃO AQUI: Verifica se o conteúdo da primeira aba NÃO ESTÁ mais no documento
    expect(screen.queryByText('Conteúdo da aba Conta.')).not.toBeInTheDocument();
  });
});