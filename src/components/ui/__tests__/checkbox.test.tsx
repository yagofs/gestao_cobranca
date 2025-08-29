// Testes unitários para o componente Checkbox (Radix)
// - Objetivo: garantir que o checkbox rende e que a prop onCheckedChange é chamada
//   ao mudar seu estado via clique.
// - Observação: usamos user-event para simular interação do usuário.
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../checkbox';

describe('Checkbox component', () => {
  test('renderiza checkbox e responde a cliques', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Checkbox onCheckedChange={onChange} /> as any);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    await user.click(checkbox);
    expect(onChange).toHaveBeenCalled();
  });
});
