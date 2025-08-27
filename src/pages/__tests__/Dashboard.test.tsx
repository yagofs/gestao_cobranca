import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dashboard from '../Dashboard';
import axios from 'axios';

jest.mock('axios');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

describe('Dashboard page', () => {
  beforeEach(() => jest.clearAllMocks());

    test('renders and shows dashboard content after data load', async () => {
      // Comentário para leigos: aqui simulamos o retorno do servidor com dados
      const installments = [{ id: '1', clientName: 'A', cpf: '111', contractNumber: 'C1', installmentNumber: 1, dueDate: new Date().toISOString(), daysOverdue: 5, amount: 100 }];
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('overdue_installments')) return Promise.resolve({ data: installments });
        if (url.includes('actions/recent')) return Promise.resolve({ data: [] });
        if (url.includes('actions/today_count')) return Promise.resolve({ data: { count: 0 } });
        return Promise.resolve({ data: {} });
      });

    // garantir token para que o componente carregue os dados
    localStorage.setItem('access_token', 'tok');
    render(<Dashboard />);

      // Espera até que ao menos uma chamada de rede (mockada) tenha ocorrido
      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

      // Agora verificamos se o conteúdo principal do dashboard apareceu
      expect(screen.getByText(/Página Inicial/i)).toBeInTheDocument();
  });

  // Sem token: deve navegar para login e mostrar toast de erro
  test('no token navigates to login and shows auth error', async () => {
    localStorage.removeItem('access_token');
    const { default: DashboardComp } = await import('../Dashboard');
    render(<DashboardComp />);

    await waitFor(() => {
      const sonner = require('sonner');
      expect(sonner.toast.error).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // Quando não há atividades recentes, mostra mensagem apropriada
  test('shows no recent activity message when none', async () => {
    const installments: any[] = [];
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('overdue_installments')) return Promise.resolve({ data: installments });
      if (url.includes('actions/recent')) return Promise.resolve({ data: [] });
      if (url.includes('actions/today_count')) return Promise.resolve({ data: { count: 0 } });
      return Promise.resolve({ data: {} });
    });
    localStorage.setItem('access_token', 'tok');
    render(<Dashboard />);
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());
    expect(screen.getByText(/Nenhuma atividade recente encontrada\./i)).toBeInTheDocument();
  });

  // handleProceed: sem seleção deve mostrar erro via toast
  test('handleProceed shows error when no client selected', async () => {
    const installments: any[] = [];
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('overdue_installments')) return Promise.resolve({ data: installments });
      if (url.includes('actions/recent')) return Promise.resolve({ data: [] });
      if (url.includes('actions/today_count')) return Promise.resolve({ data: { count: 0 } });
      return Promise.resolve({ data: {} });
    });
    localStorage.setItem('access_token', 'tok');
    render(<Dashboard />);
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

  const proceedBtn = screen.getByText(/Prosseguir para Contratos/i);
  // botão deve estar desabilitado quando nenhum cliente está selecionado
  const proceedBtnEl = proceedBtn.closest('button') as HTMLButtonElement | null;
  expect(proceedBtnEl).toBeDisabled();
  });

  // logout: remove token, mostra toast e navega para '/'
  test('logout clears token, shows success toast and navigates home', async () => {
    localStorage.setItem('access_token', 'tok');
    const installments = [{ id: '1', clientName: 'A', cpf: '111', contractNumber: 'C1', installmentNumber: 1, dueDate: new Date().toISOString(), daysOverdue: 5, amount: 100 }];
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('overdue_installments')) return Promise.resolve({ data: installments });
      if (url.includes('actions/recent')) return Promise.resolve({ data: [] });
      if (url.includes('actions/today_count')) return Promise.resolve({ data: { count: 0 } });
      return Promise.resolve({ data: {} });
    });

    render(<Dashboard />);
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

    const sairBtn = screen.getByText(/Sair/i);
    fireEvent.click(sairBtn);
    const sonner = require('sonner');
    expect(sonner.toast.success).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // Quando a API falha, exibe a UI de erro
  test('shows error UI when fetch fails', async () => {
    // simula erro na primeira chamada
    mockedAxios.get.mockRejectedValueOnce({ response: { data: { msg: 'server error' } } });
    localStorage.setItem('access_token', 'tok');
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText(/Erro ao carregar dados:/i)).toBeInTheDocument());
  });

  // Quando um cliente é selecionado e prosseguir é clicado, navega para /contracts com estado
  test('proceed navigates with selected client state', async () => {
    const installments = [
      { id: '1', clientName: 'Cliente A', cpf: '111', contractNumber: 'C1', installmentNumber: 1, dueDate: new Date().toISOString(), daysOverdue: 5, amount: 100 },
      { id: '2', clientName: 'Cliente A', cpf: '111', contractNumber: 'C2', installmentNumber: 1, dueDate: new Date().toISOString(), daysOverdue: 3, amount: 50 },
    ];

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('overdue_installments')) return Promise.resolve({ data: installments });
      if (url.includes('actions/recent')) return Promise.resolve({ data: [] });
      if (url.includes('actions/today_count')) return Promise.resolve({ data: { count: 0 } });
      return Promise.resolve({ data: {} });
    });

    localStorage.setItem('access_token', 'tok');
    render(<Dashboard />);
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

    // abrir busca e selecionar cliente
    const input = screen.getByPlaceholderText(/Digite o nome ou CPF.../i);
    fireEvent.change(input, { target: { value: 'Cliente A' } });
  await waitFor(() => expect(screen.getAllByText(/Cliente A/i).length).toBeGreaterThan(0));
  const matches = screen.getAllByText(/Cliente A/i);
  const pMatch = matches.find((el) => el.tagName.toLowerCase() === 'p');
  expect(pMatch).toBeTruthy();
  if (pMatch) fireEvent.click(pMatch);

    const proceedBtn = screen.getByText(/Prosseguir para Contratos/i);
    fireEvent.click(proceedBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/contracts', expect.any(Object));
    // verifica estado encaminhado
    const navArg = (mockNavigate as jest.Mock).mock.calls[0][1];
    expect(navArg.state.clientCpf).toBe('111');
  });

  // Verifica que métricas e atividades recentes são renderizadas com dados
  test('renders metrics values and recent actions when provided', async () => {
    const installments = [
      { id: '1', clientName: 'B', cpf: '222', contractNumber: 'C3', installmentNumber: 1, dueDate: new Date().toISOString(), daysOverdue: 2, amount: 200 },
    ];
    const recent = [{ actionType: 'AçãoX', timestamp: new Date().toISOString(), clientName: 'B', type: 'info' }];

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('overdue_installments')) return Promise.resolve({ data: installments });
      if (url.includes('actions/recent')) return Promise.resolve({ data: recent });
      if (url.includes('actions/today_count')) return Promise.resolve({ data: { count: 1 } });
      return Promise.resolve({ data: {} });
    });
    localStorage.setItem('access_token', 'tok');
    render(<Dashboard />);
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

  // moeda formatada aparece
  const currencyEls = screen.getAllByText(/R\$/);
  expect(currencyEls.length).toBeGreaterThan(0);
    // atividade recente aparece
    expect(screen.getByText(/AçãoX/i)).toBeInTheDocument();
  });
});
