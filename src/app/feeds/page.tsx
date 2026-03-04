import { getAllFeeds } from "@/lib/services/feed-management.service";
import type { Feed } from "@/lib/types/feed.types";

function formatDate(dateString: string | null): string {
  if (!dateString) return "Nooit";
  return new Date(dateString).toLocaleString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FeedRow({ feed }: { feed: Feed }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4 font-medium text-gray-900">{feed.label}</td>
      <td className="py-3 px-4 text-sm text-gray-600 break-all">{feed.url}</td>
      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
        {formatDate(feed.lastFetchedAt)}
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-500">
      <p className="text-lg">Geen feeds geconfigureerd.</p>
      <p className="text-sm mt-1">
        Voeg een RSS-feed toe om te beginnen.
      </p>
    </div>
  );
}

export default async function FeedsPage() {
  const feeds = await getAllFeeds();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">RSS Feeds</h1>

      {feeds.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                  Label
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                  URL
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                  Laatste ophaling
                </th>
              </tr>
            </thead>
            <tbody>
              {feeds.map((feed) => (
                <FeedRow key={feed.id} feed={feed} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
