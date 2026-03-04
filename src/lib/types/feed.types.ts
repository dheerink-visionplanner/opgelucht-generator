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

export const updateFeedInputSchema = z.object({
  label: z.string().min(1, "Label is verplicht").max(100),
  url: z.string().url("Ongeldige URL"),
});

export type UpdateFeedInput = z.infer<typeof updateFeedInputSchema>;
