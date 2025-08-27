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
});
