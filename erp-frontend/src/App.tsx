import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/routes/AppRouter';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ToastProvider } from '@/components/shared/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
