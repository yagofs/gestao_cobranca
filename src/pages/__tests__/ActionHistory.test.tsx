import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ActionHistory from '../ActionHistory';
import axios from 'axios';

jest.mock('axios');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn(), useLocation: () => ({ state: { clientCpf: '111', contractNumber: 'C1' } }) }));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ActionHistory page', () => {
  beforeEach(() => jest.clearAllMocks());

  test('loads client and actions', async () => {
    // garantir token para chamadas autenticadas
    localStorage.setItem('access_token', 'tok');
    mockedAxios.get.mockResolvedValueOnce({ data: { id: '1', name: 'Client', cpf: '111', phones: ['123'] } });
    mockedAxios.get.mockResolvedValueOnce({ data: [{ actionType: 'test', timestamp: new Date().toISOString(), notes: 'ok' }] });

    render(<ActionHistory />);

    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());
    expect(screen.getByText(/Histórico e Registro de Ação/i)).toBeInTheDocument();
  });
});
