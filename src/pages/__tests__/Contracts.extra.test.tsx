import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Contracts from '../Contracts';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useLocation: () => ({ state: { clientCpf: '111' } }), useNavigate: () => mockNavigate }));

describe('Contracts extra branches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('navigates to login when no token', async () => {
    localStorage.removeItem('access_token');
    render(<Contracts />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });

  test('shows error when fetch client returns not ok', async () => {
    localStorage.setItem('access_token', 'tok');
    (global as any).fetch = jest.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ msg: 'err' }) }));
    render(<Contracts />);
    await waitFor(() => expect(screen.getByText(/Erro:/i)).toBeInTheDocument());
  });
});
