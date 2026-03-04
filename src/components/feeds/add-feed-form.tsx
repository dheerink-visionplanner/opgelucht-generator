"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormStatus = "idle" | "loading" | "success" | "error";

export function AddFeedForm() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, url }),
      });

      const data: { error?: string } = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Opslaan mislukt");
        return;
      }

      setStatus("success");
      setLabel("");
      setUrl("");
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Netwerkfout bij het opslaan van de feed");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-6 mb-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Feed toevoegen
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="feed-label"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Label
          </label>
          <input
            id="feed-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="bijv. roken"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex-[2]">
          <label
            htmlFor="feed-url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            RSS-feed URL
          </label>
          <input
            id="feed-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://www.google.com/alerts/feeds/..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className={`
            inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium
            text-white shadow-sm transition-colors whitespace-nowrap
            ${
              status === "loading"
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }
          `}
        >
          {status === "loading" ? "Verwerken..." : "Feed toevoegen"}
        </button>
      </div>

      {status === "success" && (
        <p className="mt-3 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">
          Feed toegevoegd
        </p>
      )}

      {status === "error" && (
        <p className="mt-3 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
