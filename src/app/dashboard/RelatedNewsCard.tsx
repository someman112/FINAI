import React, { useEffect, useState } from "react";

interface RelatedNewsCardProps {
  symbol: string; // Stock symbol to fetch news for
}

export default function RelatedNewsCard({ symbol }: RelatedNewsCardProps) {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/news/${symbol}`);
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();
        setHeadlines(data.news || []);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load news");
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [symbol]);

  return (
    <div className="relative rounded-xl">
      <div className="relative rounded-xl border border-gray-800/50 p-2">
        <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-5 z-10">
          <h2 className="text-xl font-semibold text-white mb-4">Related News</h2>
          <div className="h-90 overflow-y-auto text-gray-400">
            {loading ? (
              <p>Loading news...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : headlines.length > 0 ? (
              <ul className="space-y-2">
                {headlines.map((headline, index) => (
                  <li key={index} className="text-sm text-gray-300">
                    {headline}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No Reuters news available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}