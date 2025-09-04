import '@testing-library/jest-dom';
// jest.setup.ts

// Mock para ResizeObserver
// Muitas bibliotecas de componentes UI usam isso para detectar mudanças de tamanho.
global.ResizeObserver = class ResizeObserver {
  observe() {
    // faz nada
  }
  unobserve() {
    // faz nada
  }
  disconnect() {
    // faz nada
  }
};

// Mock para window.matchMedia
// Usado para verificar media queries (ex: checar se a tela é de mobile).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // obsoleto
    removeListener: jest.fn(), // obsoleto
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});