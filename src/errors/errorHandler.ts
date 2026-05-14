type ErrorContext = {
  operation?: string
  silent?: boolean
}

export function handleError(error: unknown, context?: ErrorContext): void {
  const message = error instanceof Error
    ? error.message
    : 'Wystapil nieoczekiwany blad.'

  const operation = context?.operation ?? 'Operacja'

  console.error(`[${operation}]`, error)

  if (context?.silent) {
    return
  }

  alert(`${operation}: ${message}`)
}

export async function safeAsync<T>(
  fn: () => Promise<T>,
  context?: ErrorContext,
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    handleError(error, context)
    return undefined
  }
}
