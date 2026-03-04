"use client";

import { useState } from "react";
import type { Feed } from "@/lib/types/feed.types";

type EditStatus = "idle" | "loading" | "error";

export function EditFeedModal({
  feed,
  onUpdated,
  onCancel,
}: {
  feed: Feed;
  onUpdated: (updated: Feed) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(feed.label);
  const [url, setUrl] = useState(feed.url);
  const [status, setStatus] = useState<EditStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/feeds/${feed.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Opslaan mislukt");
        return;
      }

      onUpdated(data.feed as Feed);
    } catch {
      setStatus("error");
      setErrorMessage("Netwerkfout bij het opslaan");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Feed bewerken
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-label"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Label
            </label>
            <input
              id="edit-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              maxLength={100}
              disabled={status === "loading"}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              RSS-feed URL
            </label>
            <input
              id="edit-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={status === "loading"}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {status === "error" && errorMessage && (
            <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={status === "loading"}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Opslaan..." : "Opslaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
