import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

jest.mock('axios');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate, useLocation: () => ({ state: { action: 'A1', comment: 'ok', clientCpf: '111', contractNumber: 'C1' } }) }));

describe('ActionConfirmation extra branches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('handles contract not found', async () => {
    localStorage.setItem('access_token', 'tok');
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // contracts list empty
    const { default: ActionConfirmation } = await import('../ActionConfirmation');
    render(<ActionConfirmation />);
    fireEvent.click(screen.getByText(/Confirmar Registro/i));
    await waitFor(() => {
      const sonner = require('sonner');
      expect(sonner.toast.error).toHaveBeenCalled();
    });
  });
});
