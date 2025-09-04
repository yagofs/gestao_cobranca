import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  // Guarda o valor original para restaurá-lo depois
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    // Limpa o mock após cada teste para não afetar outros arquivos
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('deve retornar "false" quando a largura da tela for de desktop', () => {
    // PASSO 1: Simula uma tela de desktop definindo a largura da janela
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Valor MAIOR que o breakpoint de 768
    });

    // PASSO 2: Renderiza o hook
    const { result } = renderHook(() => useIsMobile());

    // PASSO 3: A verificação agora vai funcionar
    expect(result.current).toBe(false);
  });

  it('deve retornar "true" quando a largura da tela for de mobile', () => {
    // PASSO 1: Simula uma tela de mobile definindo a largura da janela
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500, // Valor MENOR que o breakpoint de 768
    });
    
    // PASSO 2: Renderiza o hook
    const { result } = renderHook(() => useIsMobile());
    
    // PASSO 3: A verificação agora vai funcionar
    expect(result.current).toBe(true);
  });
});