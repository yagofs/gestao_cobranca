import React from 'react';
import { render, screen } from '@testing-library/react';
import Index from '../Index';

describe('Index page', () => {
  test('renders welcome message', () => {
    render(<Index />);
    expect(screen.getByText(/Welcome to Your Blank App/i)).toBeInTheDocument();
  });
});
