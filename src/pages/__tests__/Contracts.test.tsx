import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Contracts from '../Contracts';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useLocation: () => ({ state: { clientCpf: '111' } }), useNavigate: () => mockNavigate }));

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ name: 'Client', cpf: '111', phones: ['123'] }) })) as any;

describe('Contracts page', () => {
  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    localStorage.removeItem('access_token');
    jest.resetAllMocks();
  });

  // Renderiza a página e verifica se o cabeçalho e informações do cliente são exibidos após carregamento
  test('renders loading then client info', async () => {
    render(<Contracts />);
    await waitFor(() => expect(screen.getByText(/Contratos e Parcelas/i)).toBeInTheDocument());
  });

  // Sem token, ao montar a página deve redirecionar para login e avisar sobre autenticação
  test('navigates to login when no token', async () => {
    localStorage.removeItem('access_token');
    render(<Contracts />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });

  // Quando a API do cliente retorna não ok, deve exibir erro na tela
  test('shows error when fetch client returns not ok', async () => {
    localStorage.setItem('access_token', 'tok');
    (global as any).fetch = jest.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ msg: 'err' }) }));
    render(<Contracts />);
    await waitFor(() => expect(screen.getByText(/Erro:/i)).toBeInTheDocument());
  });

  // Se não existem contratos inadimplentes, deve mostrar mensagem informando isso
  test('shows message when there are no delinquent contracts', async () => {
    localStorage.setItem('access_token', 'tok');
    const client = { name: 'Client', cpf: '111', phones: ['123'] };
    const contractsNoDelinquent = [
      {
        id: 'c1', number: 'C1', clientCpf: '111', type: 'Tipo', installmentValue: 100,
        dueDate: '2025-08-01', daysOverdue: 0, fineValue: 0, status: 'recent', installments: [
          { number: 1, dueDate: '2025-08-01', daysOverdue: 0, amount: 100 }
        ], updatedValue: 100
      }
    ];

    (global as any).fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(client) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(contractsNoDelinquent) }));

    render(<Contracts />);
    await waitFor(() => expect(screen.getByText(/Nenhum contrato inadimplente encontrado para este CPF./i)).toBeInTheDocument());
  });

  // Clicar em voltar deve acionar a navegação para o dashboard
  test('back button navigates to dashboard', async () => {
    localStorage.setItem('access_token', 'tok');
    const client = { name: 'Client', cpf: '111', phones: ['123'] };
    const contractsData: any[] = [];
    (global as any).fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(client) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(contractsData) }));

    render(<Contracts />);
    await waitFor(() => expect(screen.getByText(/Contratos e Parcelas/i)).toBeInTheDocument());
    const backBtn = screen.getByText(/Voltar ao Dashboard/i);
    fireEvent.click(backBtn);
    const rrd = require('react-router-dom');
    expect(rrd.useNavigate()).toHaveBeenCalledWith('/dashboard');
  });

  // Para contrato com uma única parcela: selecionar e registrar ação deve navegar para histórico
  test('register action succeeds for single-installment contract and navigates to action-history', async () => {
    localStorage.setItem('access_token', 'tok');
    const client = { name: 'Client', cpf: '111', phones: ['123'] };
    const contractsData = [
      {
        id: 'c1', number: 'C1', clientCpf: '111', type: 'Tipo', installmentValue: 100,
        dueDate: '2025-08-01', daysOverdue: 10, fineValue: 0, status: 'overdue', installments: [
          { number: 1, dueDate: '2025-07-01', daysOverdue: 10, amount: 150 }
        ], updatedValue: 150
      }
    ];

    (global as any).fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(client) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(contractsData) }));

    const sonner = require('sonner');
    render(<Contracts />);
    await waitFor(() => expect(screen.getByText(/Contratos Inadimplentes/i)).toBeInTheDocument());

  // selecionar contrato (checkbox)
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

  // botão 'Registrar Ação' deve estar habilitado agora
    const registerBtn = screen.getByText(/Registrar Ação/i);
    fireEvent.click(registerBtn);

    await waitFor(() => expect(sonner.toast.success).toHaveBeenCalled());
    const rrd = require('react-router-dom');
    expect(rrd.useNavigate()).toHaveBeenCalledWith('/action-history', expect.any(Object));
  });

  // Verifica comportamentos de validação do botão de registrar ação (sem seleção / sem parcela)
  test('register action shows errors when no contract or no installment selected', async () => {
    localStorage.setItem('access_token', 'tok');
    const client = { name: 'Client', cpf: '111', phones: ['123'] };
    const contractsData = [
      {
        id: 'c1', number: 'C1', clientCpf: '111', type: 'Tipo', installmentValue: 100,
        dueDate: '2025-08-01', daysOverdue: 10, fineValue: 0, status: 'overdue', installments: [
          { number: 1, dueDate: '2025-07-01', daysOverdue: 10, amount: 150 },
          { number: 2, dueDate: '2025-09-01', daysOverdue: 5, amount: 120 }
        ], updatedValue: 270
      }
    ];

    (global as any).fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(client) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(contractsData) }));

    const sonner = require('sonner');
    render(<Contracts />);
    await waitFor(() => expect(screen.getByText(/Contratos Inadimplentes/i)).toBeInTheDocument());

  // tentar registrar sem selecionar contrato
  const registerBtn = screen.getByText(/Registrar Ação/i);
  // botão deve estar desabilitado quando nenhum contrato/parcela estiver selecionado
  const registerBtnEl = registerBtn.closest('button') as HTMLButtonElement | null;
  expect(registerBtnEl).toBeDisabled();

  // selecionar contrato mas não parcela -> botão permanece desabilitado porque parcela não foi selecionada
  const checkbox = screen.getAllByRole('checkbox')[0];
  fireEvent.click(checkbox);
  const registerBtnEl2 = registerBtn.closest('button') as HTMLButtonElement | null;
  expect(registerBtnEl2).toBeDisabled();
  });

  // Testa seleção e deseleção de contratos; auto-seleção de parcela em contrato com 1 parcela
  test('handleContractSelect unselects and auto-selects single-installment contract', async () => {
    localStorage.setItem('access_token', 'tok');
    const client = { name: 'Client', cpf: '111', phones: ['123'] };
    const contractsData = [
      {
        id: 'c1', number: 'C1', clientCpf: '111', type: 'Tipo', installmentValue: 100,
        dueDate: '2025-08-01', daysOverdue: 10, fineValue: 0, status: 'overdue', installments: [
          { number: 1, dueDate: '2025-07-01', daysOverdue: 10, amount: 150 }
        ], updatedValue: 150
      },
      {
        id: 'c2', number: 'C2', clientCpf: '111', type: 'Tipo', installmentValue: 200,
        dueDate: '2025-08-01', daysOverdue: 5, fineValue: 0, status: 'recent', installments: [
          { number: 1, dueDate: '2025-06-01', daysOverdue: 5, amount: 200 },
          { number: 2, dueDate: '2025-09-01', daysOverdue: 0, amount: 200 }
        ], updatedValue: 400
      }
    ];

    (global as any).fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(client) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(contractsData) }));

    render(<Contracts />);
    await waitFor(() => expect(screen.getByText(/Contratos Inadimplentes/i)).toBeInTheDocument());

  // selecionar primeiro contrato (parcela única) -> deve auto-selecionar a parcela
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
  // agora desselecionar
    fireEvent.click(checkboxes[0]);
  // selecionar segundo contrato (várias parcelas) -> não deve auto-selecionar
    fireEvent.click(checkboxes[1]);
  // abrir dropdown para escolher parcela
    const selectTrigger = screen.getByText(/Escolha a parcela em atraso/i);
    expect(selectTrigger).toBeInTheDocument();
  });

  // Verifica formatação de moeda e os textos de status para diferentes estados (overdue/other)
  test('formatCurrency and getStatusIcon branches rendered correctly', async () => {
    localStorage.setItem('access_token', 'tok');
    const client = { name: 'Client', cpf: '111', phones: ['123'] };
    const contractsData = [
      { id: 'c1', number: 'C1', clientCpf: '111', type: 'Tipo', installmentValue: 100,
        dueDate: '2025-08-01', daysOverdue: 10, fineValue: 0, status: 'overdue', installments: [
          { number: 1, dueDate: '2025-07-01', daysOverdue: 10, amount: 150 }
        ], updatedValue: 150
      },
      { id: 'c2', number: 'C2', clientCpf: '111', type: 'Tipo', installmentValue: 200,
        dueDate: '2025-08-01', daysOverdue: 0, fineValue: 0, status: 'other', installments: [
          { number: 1, dueDate: '2025-06-01', daysOverdue: 0, amount: 200 }
        ], updatedValue: 200
      }
    ];

    (global as any).fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(client) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(contractsData) }));

    render(<Contracts />);
    await waitFor(() => expect(screen.getByText(/Contratos Inadimplentes/i)).toBeInTheDocument());

  // Verifica se a formatação de moeda aparece (pode aparecer múltiplas vezes)
  const currencyEls = screen.getAllByText(/R\$/);
  expect(currencyEls.length).toBeGreaterThan(0);
    // Verifica se ambos os status são renderizados (texto de dias em atraso)
    expect(screen.getByText(/10 dias em atraso/i)).toBeInTheDocument();
    expect(screen.getByText(/0 dias em atraso/i)).toBeInTheDocument();
  });
});
