export function logServerError(context: string, error: unknown): void {
  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : String(error);
  const code =
    error && typeof error === 'object' && 'code' in error
      ? (error as { code?: unknown }).code
      : undefined;
  console.error(`[${context}] ${message}${code !== undefined ? ` (code: ${String(code)})` : ''}`);
}
