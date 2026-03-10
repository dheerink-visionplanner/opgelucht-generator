import { z } from "zod";

export const newsItemSchema = z.object({
  id: z.number(),
  feedId: z.number().nullable(),
  title: z.string(),
  url: z.string().url(),
  publicationDate: z.string().nullable(),
  sourceName: z.string().nullable(),
  isPaywalled: z.boolean(),
  status: z.string(),
  createdAt: z.string(),
});

export type NewsItem = z.infer<typeof newsItemSchema>;
