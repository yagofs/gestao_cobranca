// Testes unitários para o componente Label
// - Objetivo: validar que o texto passado como children é renderizado.
// - Observação: Label é um wrapper do Radix Label, sem lógica externa.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label component', () => {
  test('renderiza o texto passado como children', () => {
    render(<Label>Meu Label</Label>);
    expect(screen.getByText('Meu Label')).toBeInTheDocument();
  });
});
