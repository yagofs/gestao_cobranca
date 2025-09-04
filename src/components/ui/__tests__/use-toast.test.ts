import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/use-toast';

describe('useToast Hook', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('deve retornar um estado inicial com a lista de toasts vazia', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('deve adicionar um novo toast quando a função toast é chamada', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Sucesso', description: 'Operação concluída.' });
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0]).toHaveProperty('title', 'Sucesso');
  });

  it('deve remover um toast quando a função dismiss é chamada', () => {
    const { result } = renderHook(() => useToast());
    let toastId: string | undefined;

    act(() => {
      const { id } = result.current.toast({ title: 'A ser removido' });
      toastId = id;
    });
    
    expect(result.current.toasts.length).toBe(1);

    act(() => {
      if(toastId) result.current.dismiss(toastId);
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.toasts.length).toBe(0);
  });
});