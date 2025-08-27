import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Contracts from '../Contracts';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useLocation: () => ({ state: { clientCpf: '111' } }), useNavigate: () => jest.fn() }));

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ name: 'Client', cpf: '111', phones: ['123'] }) })) as any;

describe('Contracts page', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders loading then client info', async () => {
    render(<Contracts />);
    await waitFor(() => expect(screen.getByText(/Contratos e Parcelas/i)).toBeInTheDocument());
  });
});
