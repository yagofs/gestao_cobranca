import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

jest.mock('axios');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

describe('Login extra branches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('shows error on failed login', async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { data: { msg: 'Invalid' } } });
    const { default: Login } = await import('../Login');
  render(<Login />);
  fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => {
      const sonner = require('sonner');
      expect(sonner.toast.error).toHaveBeenCalled();
    });
  });
});
