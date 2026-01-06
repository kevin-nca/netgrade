import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import App from '@/App';

vi.mock('@/AppRouter', () => ({
  AppRouter: () => <div>AppRouter</div>,
}));

vi.mock('@ionic/react', () => ({
  IonApp: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  setupIonicReact: vi.fn(),
}));

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}));

describe('App', () => {
  it('should render without crashing', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    expect(() => {
      render(<App queryClient={queryClient} />);
    }).not.toThrow();
  });
});
