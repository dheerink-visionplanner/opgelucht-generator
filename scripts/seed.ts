import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/db/schema";

async function seed() {
  const db = drizzle(process.env.DB_FILE_NAME!, { schema });

  console.log("Seeding categories...");

  const defaultCategories = [
    { name: "Overheid", sortOrder: 1 },
    { name: "Politiek", sortOrder: 2 },
    { name: "Wetenschap", sortOrder: 3 },
    { name: "Onderwijs", sortOrder: 4 },
    { name: "Kort nieuws", sortOrder: 5 },
    { name: "Opinie", sortOrder: 6 },
    { name: "Rookgordijn", sortOrder: 7 },
    { name: "Brancheorganisaties", sortOrder: 8 },
    { name: "Persberichten", sortOrder: 9 },
  ];

  for (const category of defaultCategories) {
    await db
      .insert(schema.categories)
      .values(category)
      .onConflictDoNothing();
    console.log(`  ✓ Category "${category.name}" seeded`);
  }

  console.log("Seeding feeds...");

  const sampleFeeds = [
    {
      label: "roken",
      url: "https://www.google.com/alerts/feeds/00978675032409498498/7498194874498498",
      isActive: true,
    },
    {
      label: "vapen",
      url: "https://www.google.com/alerts/feeds/00978675032409498498/1234567890123456",
      isActive: true,
    },
    {
      label: "nicotine",
      url: "https://www.google.com/alerts/feeds/00978675032409498498/9876543210987654",
      isActive: true,
    },
  ];

  for (const feed of sampleFeeds) {
    await db
      .insert(schema.feeds)
      .values(feed)
      .onConflictDoNothing();
    console.log(`  ✓ Feed "${feed.label}" seeded`);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
