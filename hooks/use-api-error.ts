"use client"

import { useState } from "react"
import { ApiClientError } from "@/lib/api-client"

export function useApiError() {
  const [error, setError] = useState<ApiClientError | null>(null)

  const handleError = (err: unknown) => {
    if (err instanceof ApiClientError) {
      setError(err)
    } else if (err instanceof Error) {
      setError(new ApiClientError(err.message, 0, "UNKNOWN_ERROR"))
    } else {
      setError(new ApiClientError("Произошла неизвестная ошибка", 0, "UNKNOWN_ERROR"))
    }
  }

  const clearError = () => setError(null)

  return {
    error,
    handleError,
    clearError,
    hasError: !!error,
  }
}
