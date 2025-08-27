import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../Register';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

describe('Register extra branches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('shows error when passwords do not match', () => {
    const { container } = render(<Register />);
    // fill inputs
    fireEvent.change(screen.getByLabelText('Nome de usuário'), { target: { value: 'u1' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'abcdef' } });
    // submit form directly
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    if (form) fireEvent.submit(form);
    const sonner = require('sonner');
    expect(sonner.toast.error).toHaveBeenCalled();
  });
});
