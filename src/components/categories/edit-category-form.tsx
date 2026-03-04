"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types/category.types";

type EditStatus = "idle" | "editing" | "saving" | "error";

export function EditCategoryForm({
  category,
  onUpdated,
}: {
  category: Category;
  onUpdated?: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<EditStatus>("idle");
  const [name, setName] = useState(category.name);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleEdit() {
    setName(category.name);
    setErrorMessage(null);
    setStatus("editing");
  }

  function handleCancel() {
    setName(category.name);
    setErrorMessage(null);
    setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Naam is verplicht");
      return;
    }
    if (trimmed === category.name) {
      setStatus("idle");
      return;
    }

    setStatus("saving");
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (response.status === 409) {
        setStatus("error");
        setErrorMessage("Naam al in gebruik");
        return;
      }

      if (!response.ok) {
        setStatus("error");
        setErrorMessage("Opslaan mislukt");
        return;
      }

      setStatus("idle");
      onUpdated?.();
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Netwerkfout bij het opslaan");
    }
  }

  if (status === "idle") {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-900 dark:text-zinc-100">{category.name}</span>
        <button
          onClick={handleEdit}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Bewerken
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === "saving"}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          autoFocus
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "saving" ? "Bijwerken..." : "Opslaan"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={status === "saving"}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Annuleren
        </button>
      </div>
      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </form>
  );
}
