"use client";

import { useState } from "react";

interface FetchSummary {
  totalParsed: number;
  totalNew: number;
  totalDuplicates: number;
  feedsWithErrors: number;
}

interface FetchResult {
  success: boolean;
  summary?: FetchSummary;
  error?: string;
}

type FetchStatus = "idle" | "loading" | "success" | "error";

export function FetchNowButton({
  onFetchComplete,
}: {
  onFetchComplete?: () => void;
}) {
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [result, setResult] = useState<FetchResult | null>(null);

  async function handleFetch() {
    setStatus("loading");
    setResult(null);

    try {
      const response = await fetch("/api/feeds/fetch", { method: "POST" });
      const data: FetchResult = await response.json();

      if (!response.ok || !data.success) {
        setStatus("error");
        setResult(data);
        return;
      }

      setStatus("success");
      setResult(data);

      onFetchComplete?.();
    } catch {
      setStatus("error");
      setResult({
        success: false,
        error: "Netwerkfout bij het ophalen van feeds",
      });
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleFetch}
        disabled={status === "loading"}
        className={`
          inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium
          text-white shadow-sm transition-colors
          ${
            status === "loading"
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          }
        `}
      >
        {status === "loading" && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {status === "loading" ? "Bezig met ophalen..." : "Nu ophalen"}
      </button>

      {status === "success" && result?.summary && (
        <span className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-md">
          {result.summary.totalNew > 0
            ? `${result.summary.totalNew} nieuwe items opgehaald`
            : "Geen nieuwe items gevonden"}
          {result.summary.feedsWithErrors > 0 && (
            <span className="text-amber-600 ml-2">
              ({result.summary.feedsWithErrors} feed(s) mislukt)
            </span>
          )}
        </span>
      )}

      {status === "error" && (
        <span className="text-sm text-red-700 bg-red-50 px-3 py-1 rounded-md">
          Fout bij het ophalen van feeds
        </span>
      )}
    </div>
  );
}
