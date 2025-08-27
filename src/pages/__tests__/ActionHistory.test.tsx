import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ActionHistory from '../ActionHistory';
import axios from 'axios';

jest.mock('axios');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const mockNavigate = jest.fn();
let mockLocationState: any = { clientCpf: '111', contractNumber: 'C1' };
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockLocationState })
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ActionHistory page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // restaura estado padrão do location mock antes de cada teste
    mockLocationState = { clientCpf: '111', contractNumber: 'C1' };
  });

  // Verifica que ao ter token válido, os dados do cliente e o histórico são carregados
  test('loads client and actions', async () => {
    // garantir token para chamadas autenticadas
    localStorage.setItem('access_token', 'tok');
    const client = { id: '1', name: 'Client', cpf: '111', phones: ['123'] };
    const actions = [{ actionType: 'test', timestamp: new Date().toISOString(), notes: 'ok' }];

    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('client_by_cpf')) return Promise.resolve({ data: client });
      if (url.includes('/api/actions/')) return Promise.resolve({ data: actions });
      return Promise.resolve({ data: [] });
    });

    render(<ActionHistory />);

    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());
    expect(screen.getByText(/Histórico e Registro de Ação/i)).toBeInTheDocument();
  });

  // Sem token, deve navegar para a página de login e mostrar erro de autenticação
  test('no token navigates to login and shows auth error', async () => {
    localStorage.removeItem('access_token');
    render(<ActionHistory />);
    await waitFor(() => {
      const sonner = require('sonner');
      expect(sonner.toast.error).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // Quando o cliente não é encontrado pela API, deve exibir mensagem de erro
  test('client not found sets error message', async () => {
    localStorage.setItem('access_token', 'tok');
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('client_by_cpf')) return Promise.resolve({ data: null });
      return Promise.resolve({ data: [] });
    });
    render(<ActionHistory />);
    await waitFor(() => expect(screen.getByText(/Cliente não encontrado\./i)).toBeInTheDocument());
  });

  // Carrega cliente, contratos e ações com query params (cobre branch de montagem de URL)
  test('loads client, contracts and actions with query params and shows data', async () => {
    localStorage.setItem('access_token', 'tok');
    const client = { id: '1', name: 'Client', cpf: '111', phones: ['123'] };
    const contracts = [ { id: 'cid', number: 'C1', type: 'Tipo', installmentValue: 100, dueDate: '2025-08-01', daysOverdue: 5, fineValue: 10 } ];
    const actions = [ { actionType: 'Contato', timestamp: new Date().toISOString(), notes: 'fez contato', operator: 'OP1', contractNumber: 'C1', installmentNumber: 1 } ];
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('client_by_cpf')) return Promise.resolve({ data: client });
      if (url.includes('/api/contracts')) return Promise.resolve({ data: contracts });
      if (url.includes('/api/actions/')) return Promise.resolve({ data: actions });
      return Promise.resolve({ data: [] });
    });

    render(<ActionHistory />);

    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());
    // contract number shown
    expect(screen.getByText(/Contrato C1/i)).toBeInTheDocument();
    // action item rendered (use getAllByText to avoid ambiguity)
    expect(screen.getAllByText(/Contato/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/fez contato/i).length).toBeGreaterThan(0);
  });

  // Botão voltar navega para /contracts com estado
  test('back button navigates to contracts with state', async () => {
    localStorage.setItem('access_token', 'tok');
    const client = { id: '1', name: 'Client', cpf: '111', phones: ['123'] };
    const contracts: any[] = [];
    const actions: any[] = [];
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('client_by_cpf')) return Promise.resolve({ data: client });
      if (url.includes('/api/contracts')) return Promise.resolve({ data: contracts });
      if (url.includes('/api/actions/')) return Promise.resolve({ data: actions });
      return Promise.resolve({ data: [] });
    });

    render(<ActionHistory />);
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

    const backBtn = screen.getByText(/Voltar aos Contratos/i);
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/contracts', expect.any(Object));
  });

  // Continua: validações de seleção/ comentário e fluxo de sucesso
  test('continue shows validation errors and navigates on success', async () => {
    localStorage.setItem('access_token', 'tok');
    const client = { id: '1', name: 'Client', cpf: '111', phones: ['123'] };
    const contracts: any[] = [];
    const actions: any[] = [];
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('client_by_cpf')) return Promise.resolve({ data: client });
      if (url.includes('/api/contracts')) return Promise.resolve({ data: contracts });
      if (url.includes('/api/actions/')) return Promise.resolve({ data: actions });
      return Promise.resolve({ data: [] });
    });

    render(<ActionHistory />);
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

    const continueBtn = screen.getByText(/Continuar/i).closest('button') as HTMLButtonElement;
    // sem ação selecionada e sem comentário -> botão desabilitado (control via disabled prop)
    expect(continueBtn).toBeDisabled();

    // selecionar ação via Select: abrir e escolher primeiro item
    const selectTrigger = screen.getByText(/Selecione a ação realizada/i);
    fireEvent.click(selectTrigger);
    const firstAction = screen.getByText(/Tentativa de contato por telefone/i);
    fireEvent.click(firstAction);

    const textarea = screen.getByPlaceholderText(/Descreva detalhadamente a ação realizada.../i);
    fireEvent.change(textarea, { target: { value: 'Comentário teste' } });

    // agora o botão não deve estar desabilitado
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/action-confirmation', expect.any(Object));
  });

  // Quando o state não possui cpf, exibe erro de CPF não fornecido
  test('shows cpf not provided error when state missing', async () => {
  // Ajusta o estado do mock de location para não fornecer CPF
  mockLocationState = {};
  render(<ActionHistory />);
  await waitFor(() => expect(screen.getByText(/CPF do cliente não fornecido\./i)).toBeInTheDocument());
  });
});
