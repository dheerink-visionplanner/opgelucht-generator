"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SubmitStatus = "idle" | "loading" | "error";

export function AddCategoryForm() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data: { error?: string } = await response.json();
        setErrorMessage(data.error ?? "Onbekende fout");
        setStatus("error");
        return;
      }

      setName("");
      setStatus("idle");
      router.refresh();
    } catch {
      setErrorMessage("Netwerkfout bij het opslaan van de categorie");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3 mt-6">
      <div className="flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nieuwe categorienaam"
          disabled={status === "loading"}
          className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        {status === "error" && errorMessage && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={status === "loading" || name.trim() === ""}
        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {status === "loading" ? "Opslaan..." : "Toevoegen"}
      </button>
    </form>
  );
}
