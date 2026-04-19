import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  last: z.boolean(),
});

export type Pagination = z.infer<typeof paginationSchema>;
