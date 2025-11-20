
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import { MOCK_COMPANIES } from '../services/mockData';

// Mock do Recharts para evitar problemas em testes unitários (canvas)
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: any }) => <div>{children}</div>,
    PieChart: () => <div>PieChart Mock</div>,
    Pie: () => null,
    Cell: () => null,
    BarChart: () => <div>BarChart Mock</div>,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    LineChart: () => <div>LineChart Mock</div>,
    Line: () => null,
  };
});

describe('App Component Smoke Tests', () => {
  it('renders Tenant Dashboard by default (Root route)', () => {
    render(<App />);
    // Verifica se o Dashboard do Tenant foi renderizado procurando um elemento único dele
    expect(screen.getByText('Visão geral dos ativos e manutenções')).toBeInTheDocument();
    expect(screen.getByText('Novo Chamado')).toBeInTheDocument();
  });

  it('loads with default company context', () => {
    render(<App />);
    // Verifica se a empresa padrão (MOCK_COMPANIES[0]) está visível no sidebar
    expect(screen.getByText(MOCK_COMPANIES[0].name)).toBeInTheDocument();
  });
});

describe('Logic Verification', () => {
  it('MOCK_COMPANIES has valid structure for SaaS Panel', () => {
    const invalidCompany = MOCK_COMPANIES.find(c => 
      !c.plan || 
      !c.limits || 
      typeof c.isOverdue === 'undefined'
    );
    expect(invalidCompany).toBeUndefined();
  });
});
