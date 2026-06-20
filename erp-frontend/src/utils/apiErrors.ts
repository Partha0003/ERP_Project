export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object' && 'message' in data) {
      return String((data as { message: string }).message);
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
