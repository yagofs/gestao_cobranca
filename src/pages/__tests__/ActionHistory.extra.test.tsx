import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

jest.mock('axios');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate, useLocation: () => ({ state: { clientCpf: '111', contractNumber: 'C1' } }) }));

describe('ActionHistory extra branches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('no token navigates to login and shows auth error', async () => {
    localStorage.removeItem('access_token');
    const { default: ActionHistory } = await import('../ActionHistory');
    render(<ActionHistory />);
    await waitFor(() => {
      const sonner = require('sonner');
      expect(sonner.toast.error).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('client not found sets error message', async () => {
    localStorage.setItem('access_token', 'tok');
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValueOnce({ data: null });
    const { default: ActionHistory } = await import('../ActionHistory');
    render(<ActionHistory />);
    await waitFor(() => expect(screen.getByText(/Cliente não encontrado\./i)).toBeInTheDocument());
  });
});
