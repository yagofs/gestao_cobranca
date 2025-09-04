import { render, screen } from '@testing-library/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card';

describe('Card', () => {
  it('deve renderizar todas as seções do card corretamente', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título do Card</CardTitle>
          <CardDescription>Descrição do Card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Este é o conteúdo principal.</p>
        </CardContent>
        <CardFooter>
          <p>Este é o rodapé.</p>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Título do Card')).toBeInTheDocument();
    expect(screen.getByText('Descrição do Card')).toBeInTheDocument();
    expect(screen.getByText('Este é o conteúdo principal.')).toBeInTheDocument();
    expect(screen.getByText('Este é o rodapé.')).toBeInTheDocument();
  });
});