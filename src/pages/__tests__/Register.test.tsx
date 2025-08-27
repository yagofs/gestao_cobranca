import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../Register';
import axios from 'axios';

jest.mock('axios');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Register page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows errors when passwords do not match or are too short', async () => {
    render(<Register />);

    const username = screen.getByPlaceholderText(/Digite seu nome de usuário/i);
    const password = screen.getByPlaceholderText(/Digite sua senha/i);
    const confirm = screen.getByPlaceholderText(/Confirme sua senha/i);
    const submit = screen.getByRole('button', { name: /Cadastrar Usuário/i });

    fireEvent.change(username, { target: { value: 'user1' } });
    // mismatch
    fireEvent.change(password, { target: { value: 'abc123' } });
    fireEvent.change(confirm, { target: { value: 'different' } });
    fireEvent.click(submit);

    await waitFor(() => {
      // toast.error should be called for mismatch (mocked in sonner)
      const sonner = require('sonner');
      expect(sonner.toast.error).toHaveBeenCalled();
    });

    // too short
    fireEvent.change(password, { target: { value: '123' } });
    fireEvent.change(confirm, { target: { value: '123' } });
    fireEvent.click(submit);

    await waitFor(() => {
      const sonner = require('sonner');
      expect(sonner.toast.error).toHaveBeenCalled();
    });
  });

  test('submits and navigates on success', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { msg: 'OK' } });
    render(<Register />);

    fireEvent.change(screen.getByPlaceholderText(/Digite seu nome de usuário/i), { target: { value: 'user2' } });
    fireEvent.change(screen.getByPlaceholderText(/Digite sua senha/i), { target: { value: 'strongpass' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirme sua senha/i), { target: { value: 'strongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /Cadastrar Usuário/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
      const sonner = require('sonner');
      expect(sonner.toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
