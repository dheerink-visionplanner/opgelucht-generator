"use client";

import { useState, useEffect, useCallback } from "react";
import type { Feed } from "@/lib/types/feed.types";
import { EditFeedModal } from "@/components/feeds/edit-feed-modal";

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

function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-500">
      <p className="text-lg">Geen feeds geconfigureerd.</p>
      <p className="text-sm mt-1">Voeg een RSS-feed toe om te beginnen.</p>
    </div>
  );
}

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);

  const loadFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/feeds");
      if (!response.ok) {
        setError("Ophalen van feeds mislukt");
        return;
      }
      const data = await response.json();
      setFeeds(data.feeds ?? []);
    } catch {
      setError("Ophalen van feeds mislukt");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  function handleUpdated(updated: Feed) {
    setFeeds((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );
    setEditingFeed(null);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">RSS Feeds</h1>

      {loading ? (
        <p className="text-gray-500 text-sm">Feeds laden...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : feeds.length === 0 ? (
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
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody>
              {feeds.map((feed) => (
                <tr
                  key={feed.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {feed.label}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 break-all">
                    {feed.url}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(feed.lastFetchedAt)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setEditingFeed(feed)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                    >
                      Bewerken
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingFeed && (
        <EditFeedModal
          feed={editingFeed}
          onUpdated={handleUpdated}
          onCancel={() => setEditingFeed(null)}
        />
      )}
    </div>
  );
}

