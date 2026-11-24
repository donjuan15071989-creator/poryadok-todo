import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get store() {
      return store;
    },
    setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
};

export const localStorageMock = createStorageMock();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(2, 11)),
  },
  writable: true,
});

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
  localStorageMock.clear.mockReset();

  // Restore default implementations
  localStorageMock.getItem.mockImplementation((key: string) => localStorageMock.store[key] ?? null);
  localStorageMock.setItem.mockImplementation((key: string, value: string) => {
    localStorageMock.store[key] = value;
  });
  localStorageMock.removeItem.mockImplementation((key: string) => {
    delete localStorageMock.store[key];
  });
  localStorageMock.clear.mockImplementation(() => {
    localStorageMock.setStore({});
  });

  vi.clearAllMocks();
});