import { z } from 'zod';
import { apiFetch } from '@/lib/client';
import { errorResponseSchema, type ErrorResponse } from '@/lib/schemas';
import { queryKeys } from './query-keys';

export { queryKeys };

export class ApiError<TField extends string = string> extends Error {
  public readonly fieldErrors: Partial<Record<TField, string>>;
  public readonly response?: ErrorResponse;

  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';

    const parsed = errorResponseSchema.safeParse(data);
    this.response = parsed.success ? parsed.data : undefined;
    this.fieldErrors = (this.response?.errors ?? {}) as Partial<Record<TField, string>>;
  }
}

export async function fetchApi<T, S extends z.ZodType<T>>(
  url: string,
  schema: S,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await apiFetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const parsedError = errorResponseSchema.safeParse(errorData);
      const errorMessage = parsedError.success
        ? parsedError.data.message || parsedError.data.error
        : (errorData as { message?: string; error?: string }).message ||
          (errorData as { message?: string; error?: string }).error;

      throw new ApiError(
        errorMessage || `API request failed: ${response.statusText}`,
        response.status,
        response.statusText,
        errorData,
      );
    }

    const data = await response.json();
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      throw new ApiError(
        `Validation failed: ${parsed.error.errors.map((e) => e.message).join(', ')}`,
        500,
        'Validation Error',
        { zodErrors: parsed.error.errors },
      );
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof z.ZodError) {
      throw new ApiError(
        `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`,
        500,
        'Validation Error',
        { zodErrors: error.errors },
      );
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500,
      'Internal Error',
    );
  }
}
