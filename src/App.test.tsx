import { render } from '@testing-library/react';
import App from './App';
import { QueryClient } from '@tanstack/react-query';

test('renders without crashing', () => {
  const { baseElement } = render(<App queryClient={new QueryClient()} />);
  expect(baseElement).toBeDefined();
});
