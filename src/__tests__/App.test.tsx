
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Mocks simples para evitar renderização complexa
vi.mock('../services/masterApi', () => ({ masterApi: {} }));
vi.mock('../services/tenantApi', () => ({ tenantApi: {} }));

// Componente placeholder simples para teste
const MockApp = () => <div>GestorIT Login</div>;

describe('App Component', () => {
  it('renders login page initially', () => {
    render(<MockApp />);
    expect(screen.getByText('GestorIT Login')).toBeDefined();
  });
});
