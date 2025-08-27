import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '../NotFound';
import { MemoryRouter } from 'react-router-dom';

describe('NotFound page', () => {
  test('renders 404 and link', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Return to Home/i)).toBeInTheDocument();
  });
});
