import React, { useEffect, useState } from "react";
import { useSymbol } from "@/context/SymbolContext"; // Import the SymbolContext hook
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface NewsItem {
  time: string;
  headline: string;
  source: string;
  link: string;
}

export default function RelatedNewsCard() {
  const { symbol } = useSymbol(); // Access the global symbol
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function fetchNews() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/news/${symbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch news for ${symbol}`);
      }

      const data = await response.json();
      console.log("Fetched news data:", data); // Log the data


      setHeadlines(data.news);
    } catch (err: any) {
      console.error("Error fetching news:", err);
      setError(err.message || "Failed to load news");
    } finally {
      setLoading(false);
    }
  }

  fetchNews();
}, [symbol]);

  const handleMouseMove = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
    const liElement = e.currentTarget;
    const rect = liElement.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse X position relative to the element
    const y = e.clientY - rect.top; // Mouse Y position relative to the element

    const offsetX = x - rect.width * 0.6;
    liElement.style.background = `radial-gradient(circle at ${offsetX}px ${y}px, rgba(0, 40, 97, 0.8), rgba(13, 13, 13, 0.15))`;
  };

  // Change this function to set a default gradient position instead of removing it
  const handleMouseLeave = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    // Instead of clearing the background, set a default gradient position
    e.currentTarget.style.background = `radial-gradient(circle at 20% 20%, rgba(0, 40, 97, 0.8), rgba(13, 13, 13, 0.15))`;
  };

  return (
    
    <div className="relative rounded-none">
      <div className="relative rounded-none border border-gray-800/50 p-2">
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="relative bg-black/40 backdrop-blur-sm rounded-none p-5 z-10">
<h2 className="font-bold text-lg text-transparent bg-clip-text" 
    style={{ 
      backgroundImage: "linear-gradient(to left, rgb(255, 255, 255) 75%, #1976d2 100%)" 
    }}>
  Related News
</h2>
          <div className="h-143 overflow-y-auto text-gray-400 custom-scrollbar">
            {loading ? (
              <p>Loading news...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : headlines.length > 0 ? (
              <ul className="space-y-2">
                {headlines.map((news, index) => (
            <li
              key={index}
              className="text-sm text-gray-300 p-2 rounded-none transition-colors duration-300"
              style={{background: `radial-gradient(circle at 20% 20%, rgba(0, 40, 97, 0.8), rgba(13, 13, 13, 0.15))`}}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={handleMouseLeave}
              aria-label={`News headline: ${news.headline}`}
            >
                    <a
                      href={news.link.startsWith("http") ? news.link : `https://finviz.com${news.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {news.headline}
                    </a>
                    <p className="text-xs text-white-500">
                      {news.time} — {news.source}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No news available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}