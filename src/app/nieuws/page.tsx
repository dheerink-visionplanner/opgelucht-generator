"use client";

import { useRouter } from "next/navigation";
import { FetchNowButton } from "@/components/feeds/fetch-now-button";

export default function NieuwsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nieuwsitems</h1>
        <FetchNowButton onFetchComplete={() => router.refresh()} />
      </div>

      {/* News item list — placeholder for Feature #3 */}
      <div className="text-gray-500 text-sm">
        Nieuwsitems worden hier weergegeven na het ophalen van feeds.
      </div>
    </div>
  );
}
