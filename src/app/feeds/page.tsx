import { getAllFeeds } from "@/lib/services/feed-management.service";
import { AddFeedForm } from "@/components/feeds/add-feed-form";
import { FeedsTable } from "./feeds-table";

export default async function FeedsPage() {
  const feeds = await getAllFeeds();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">RSS Feeds</h1>

      <AddFeedForm />

      <FeedsTable feeds={feeds} />
    </div>
  );
}

