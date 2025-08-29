// Testes unitários para o componente MetricCard
// - Objetivo: validar renderização de título, valor, ícone, subtitle e trend.
// - Observação: não há chamadas ao backend; testamos apenas saída/DOM.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../metric-card';
import { LucideIcon } from 'lucide-react';

const MockIcon = (props: any) => <svg data-testid="icon" {...props} />;

describe('MetricCard component', () => {
  test('mostra título, valor e ícone', () => {
    render(<MetricCard title="T1" value={123} icon={MockIcon as unknown as LucideIcon} />);
    expect(screen.getByText('T1')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  test('exibe subtitle e trend positivo', () => {
    render(
      <MetricCard
        title="T2"
        value="1.2k"
        subtitle="sub"
        icon={MockIcon as unknown as LucideIcon}
        trend={{ value: 5, isPositive: true }}
      />
    );
    expect(screen.getByText('sub')).toBeInTheDocument();
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });
});
