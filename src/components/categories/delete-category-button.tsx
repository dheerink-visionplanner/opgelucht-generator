"use client";

import { useState } from "react";

interface DeleteCategoryButtonProps {
  categoryId: number;
  categoryName: string;
  onDeleted?: () => void;
}

type DeleteStatus = "idle" | "loading" | "error";

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  onDeleted,
}: DeleteCategoryButtonProps) {
  const [status, setStatus] = useState<DeleteStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setErrorMessage(null);

    let articleCount = 0;

    try {
      const response = await fetch(`/api/categories/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        articleCount = data.articleCount ?? 0;
      }
    } catch {
      // Ignore fetch errors for the count; proceed with simple confirmation.
    }

    const confirmMessage =
      articleCount > 0
        ? `Deze categorie heeft ${articleCount} artikel(en). Weet je zeker dat je hem wilt verwijderen?`
        : `Weet je zeker dat je '${categoryName}' wilt verwijderen?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(
          (data as { error?: string }).error ?? "Verwijderen mislukt"
        );
        setStatus("error");
        return;
      }

      onDeleted?.();
    } catch {
      setErrorMessage("Netwerkfout bij het verwijderen");
      setStatus("error");
    }
  }

  return (
    <span className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className={`text-sm font-medium transition-colors ${
          status === "loading"
            ? "text-zinc-400 cursor-not-allowed"
            : "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        }`}
      >
        {status === "loading" ? "Verwijderen..." : "Verwijderen"}
      </button>
      {status === "error" && errorMessage && (
        <span className="text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </span>
      )}
    </span>
  );
}
