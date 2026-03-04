"use client";

import { useState } from "react";

interface DeleteFeedButtonProps {
  feedId: number;
  feedLabel: string;
  onDeleted?: () => void;
}

export function DeleteFeedButton({ feedId, feedLabel, onDeleted }: DeleteFeedButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Weet je zeker dat je de feed "${feedLabel}" wilt verwijderen?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/feeds/${feedId}`, { method: "DELETE" });
      if (response.ok) {
        onDeleted?.();
      } else {
        const data = await response.json();
        window.alert(`Verwijderen mislukt: ${data.error ?? "Onbekende fout"}`);
      }
    } catch {
      window.alert("Netwerkfout bij het verwijderen van de feed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className={`
        inline-flex items-center rounded px-2 py-1 text-sm font-medium
        text-white transition-colors
        ${
          isLoading
            ? "bg-red-300 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        }
      `}
    >
      {isLoading ? "Verwijderen..." : "Verwijderen"}
    </button>
  );
}
