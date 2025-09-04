import { render, screen } from '@testing-library/react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../pagination';
import '@testing-library/jest-dom';

describe('Pagination', () => {
  it('renderiza link de página corretamente', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/page/1">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    // CORREÇÃO: O nome acessível do link é apenas o texto dentro dele, "1".
    const linkElement = screen.getByRole('link', { name: '1' });
    expect(linkElement).toHaveAttribute('href', '/page/1');
  });

  it('deve renderizar os botões "anterior" e "próximo" habilitados quando recebem href', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    // Os nomes de acessibilidade padrão do Radix UI são em inglês
    const prevButton = screen.getByRole('link', { name: /go to previous page/i });
    const nextButton = screen.getByRole('link', { name: /go to next page/i });

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('deve renderizar o botão "anterior" desabilitado quando não há href', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    // CORREÇÃO: Verificamos o comportamento: o texto existe, mas o link clicável não.
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /go to previous page/i })
    ).not.toBeInTheDocument();
  });

  it('deve renderizar o botão "próximo" desabilitado quando não há href', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

   
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /go to next page/i })
    ).not.toBeInTheDocument();
  });
});