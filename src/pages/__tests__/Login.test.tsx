import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import axios from 'axios';

jest.mock('axios');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Login page', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders and performs login flow', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { access_token: 'tok' } });
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/Digite seu usuário/i), { target: { value: 'john' } });
    fireEvent.change(screen.getByPlaceholderText(/Digite sua senha/i), { target: { value: 'pass' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
      const sonner = require('sonner');
      expect(sonner.toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
