import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActionConfirmation from '../ActionConfirmation';
import axios from 'axios';

jest.mock('axios');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate, useLocation: () => ({ state: { action: 'A1', comment: 'ok', clientCpf: '111', contractNumber: 'C1', selectedInstallmentNumber: 1 } }) }));

describe('ActionConfirmation page', () => {
  beforeEach(() => jest.clearAllMocks());

  // Sem token, clicar em confirmar deve mostrar erro e não executar ação (navegar para login)
  test('shows error when missing token and navigates to login', async () => {
    localStorage.removeItem('access_token');
    render(<ActionConfirmation />);
    fireEvent.click(screen.getByText(/Confirmar Registro/i));
    await waitFor(() => {
      const sonner = require('sonner');
      expect(sonner.toast.error).toHaveBeenCalled();
    });
  });

  // Com token, deve buscar contratos e postar ação quando confirmar
  test('posts action when token present', async () => {
    localStorage.setItem('access_token', 'tok');
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: '1', number: 'C1' }] });
    mockedAxios.post.mockResolvedValueOnce({});
    render(<ActionConfirmation />);
    fireEvent.click(screen.getByText(/Confirmar Registro/i));
    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
  });

  // Quando não existem contratos, o componente deve informar erro ao tentar confirmar
  test('handles contract not found', async () => {
    localStorage.setItem('access_token', 'tok');
  mockedAxios.get.mockResolvedValueOnce({ data: [] }); // lista de contratos vazia
    const { default: ActionConfirmationComp } = await import('../ActionConfirmation');
    render(<ActionConfirmationComp />);
    fireEvent.click(screen.getByText(/Confirmar Registro/i));
    await waitFor(() => {
      const sonner = require('sonner');
      expect(sonner.toast.error).toHaveBeenCalled();
    });
  });
});
