import { z } from "zod";

export const parsedNewsItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  publicationDate: z.string().nullable(),
  sourceName: z.string().nullable(),
});

export type ParsedNewsItem = z.infer<typeof parsedNewsItemSchema>;

export const fetchResultSchema = z.object({
  feedId: z.number(),
  feedLabel: z.string(),
  itemsParsed: z.number(),
  itemsNew: z.number(),
  itemsSkippedDuplicate: z.number(),
  errors: z.array(z.string()),
  feedError: z.string().nullable(),
});

export type FeedFetchResult = z.infer<typeof fetchResultSchema>;
