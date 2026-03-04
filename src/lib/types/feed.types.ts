import { z } from "zod";

export const feedSchema = z.object({
  id: z.number(),
  label: z.string(),
  url: z.string().url(),
  isActive: z.boolean(),
  lastFetchedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Feed = z.infer<typeof feedSchema>;
