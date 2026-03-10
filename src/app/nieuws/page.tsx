"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { FetchNowButton } from "@/components/feeds/fetch-now-button";
import type { NewsItem } from "@/lib/types/news-item.types";

export default function NieuwsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/news-items");
      if (!response.ok) {
        setError("Ophalen van nieuwsitems mislukt");
        return;
      }
      const data = await response.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Ophalen van nieuwsitems mislukt");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function handleFetchComplete() {
    router.refresh();
    loadItems();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Nieuwsitems</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-500 mt-1">
              {total} onverwerkte items
            </p>
          )}
        </div>
        <FetchNowButton onFetchComplete={handleFetchComplete} />
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Nieuwsitems laden...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Geen onverwerkte nieuwsitems. Haal feeds op om nieuwe items te laden.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 p-4">
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-700 hover:underline line-clamp-2"
                >
                  {item.title}
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  {item.sourceName ?? "Onbekende bron"}
                  {item.publicationDate && (
                    <span className="ml-2">
                      &middot;{" "}
                      {new Date(item.publicationDate).toLocaleDateString(
                        "nl-NL"
                      )}
                    </span>
                  )}
                </p>
              </div>
              {item.isPaywalled && (
                <span
                  className="shrink-0 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800"
                  title="Dit artikel staat achter een betaalmuur"
                >
                  Betaalmuur
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

