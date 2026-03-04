import { z } from "zod";

export const categorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Category = z.infer<typeof categorySchema>;
