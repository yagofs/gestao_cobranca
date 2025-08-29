// Testes unitários para o componente Table
// - Objetivo: verificar que a estrutura da tabela (caption, thead, tbody) rende
//   corretamente quando usada com os subcomponentes exportados.
// - Observação: não há interação com backend; os testes são puramente de renderização DOM.
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from '../table';

describe('Table component', () => {
  test('renderiza estrutura básica com caption, head e body', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Col A</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell A1</TableCell>
          </TableRow>
        </TableBody>
        <TableCaption>Legenda</TableCaption>
      </Table>
    );

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('Col A')).toBeInTheDocument();
    expect(screen.getByText('Cell A1')).toBeInTheDocument();
    expect(screen.getByText('Legenda')).toBeInTheDocument();
  });
});
