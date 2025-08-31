"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatedNavbar } from "@/components/ui/resizable-navbar";
import { ThemeSwitcher } from "@/components/ui/themeswitch";
import { Logo } from "@/components/ui/logo";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { SymbolProvider } from "@/context/SymbolContext";
import { FaArrowRight, FaChartLine, FaRobot, FaSpinner } from "react-icons/fa";

// WebSocket news item structure
interface WebSocketNewsItem {
  id: number;
  date: string; // ISO date string
  text: string;  // This is what your server sends
}

// Enhanced news item with AI analysis
interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  summary: string;
  url: string;
  aiAnalysis: {
    sentiment: "positive" | "neutral" | "negative";
    marketImpact: string;
    relatedSymbols: string[];
    confidenceScore: number;
  };
}

// Function to extract relative time
const getRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
};

// Function to extract headline and source from WebSocket message
const extractHeadline = (message: string): { headline: string; source: string } => {
  // Safety check - ensure message is a string
  if (!message || typeof message !== 'string') {
    return {
      headline: "Unknown headline",
      source: "Unknown source"
    };
  }
  
  try {
    // Look for pattern like "*HEADLINE: SOURCE" or just extract the message
    const headlineMatch = message.match(/\*([^:]+):\s*(.+)/);
    
    if (headlineMatch) {
      // Split the second group by newline to handle source attribution like "(@Source)"
      const parts = headlineMatch[2].split('\n');
      return {
        headline: headlineMatch[1].trim(),
        source: parts.length > 1 ? parts[1].replace(/[@()]/g, '').trim() : "Financial News"
      };
    }
    
    // If no match, try to find a source at the end in parentheses
    const sourceMatch = message.match(/(.+)\n\(@([^)]+)\)$/);
    if (sourceMatch) {
      return {
        headline: sourceMatch[1].trim(),
        source: sourceMatch[2].trim()
      };
    }
    
    // Default case - just return the message
    const firstLine = message.split('\n')[0].trim();
    return {
      headline: firstLine || "Unknown headline",
      source: message.includes('@') ? 
        message.match(/@([A-Za-z0-9_]+)/)?.[1] || "Financial News" : 
        "Financial News"
    };
  } catch (error) {
    console.error("Error extracting headline:", error);
    return {
      headline: message.substring(0, 100),
      source: "Financial News"
    };
  }
};

// Function to generate mock AI analysis based on news content
const generateMockAiAnalysis = (title: string, content: string = "") => {
  // Basic sentiment analysis based on keywords
  const positiveKeywords = ["growth", "increase", "rise", "gain", "positive", "higher", "up", "boost", "rally"];
  const negativeKeywords = ["drop", "fall", "decline", "decrease", "negative", "lower", "down", "cut", "loss"];
  
  const titleAndContent = (title + " " + content).toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = titleAndContent.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  negativeKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = titleAndContent.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (positiveCount > negativeCount) sentiment = "positive";
  if (negativeCount > positiveCount) sentiment = "negative";
  
  // Extract potential stock tickers (simple heuristic - words in all caps)
  const words = titleAndContent.split(/\s+/);
  const potentialTickers = words
    .filter(word => /^[A-Z]{2,5}$/.test(word))
    .filter(ticker => !["US", "UK", "EU", "GDP", "CEO", "CFO", "CTO"].includes(ticker))
    .slice(0, 4);
  
  // Add some common ETFs based on content
  const defaultTickers: string[] = [];
  if (titleAndContent.includes("tech") || titleAndContent.includes("technology")) 
    defaultTickers.push("QQQ", "XLK");
  if (titleAndContent.includes("oil") || titleAndContent.includes("energy"))
    defaultTickers.push("XLE", "USO");
  if (titleAndContent.includes("bank") || titleAndContent.includes("financial"))
    defaultTickers.push("XLF", "KBE");
  if (titleAndContent.includes("health") || titleAndContent.includes("pharmaceutical"))
    defaultTickers.push("XLV", "VHT");
  
  // Combine and deduplicate tickers
  const relatedSymbols = Array.from(new Set([...potentialTickers, ...defaultTickers]));
  
  // If we couldn't find any, add some defaults
  if (relatedSymbols.length === 0) relatedSymbols.push("SPY", "QQQ");
  
  const impacts = {
    positive: [
      "This news could drive positive sentiment in related sectors and stocks.",
      "Markets typically react favorably to this kind of development.",
      "Investors might view this as a bullish signal for the affected companies.",
      "This development could lead to increased buying interest in the short term."
    ],
    neutral: [
      "This news is unlikely to have a significant market impact in isolation.",
      "Markets may need more information before reacting to this development.",
      "The impact might be limited to specific companies rather than broader sectors.",
      "Mixed implications make it difficult to predict a clear market response."
    ],
    negative: [
      "This could create downward pressure on affected stocks and sectors.",
      "Markets typically react negatively to this type of news.",
      "Investors might take a more cautious stance following this development.",
      "This might trigger profit-taking or defensive positioning in related areas."
    ]
  };
  
  const confidenceScore = 0.7 + (Math.random() * 0.25); // Random between 0.7-0.95
  
  return {
    sentiment,
    marketImpact: impacts[sentiment][Math.floor(Math.random() * impacts[sentiment].length)],
    relatedSymbols,
    confidenceScore
  };
};

// Convert WebSocket news item to our NewsItem format
const convertWebSocketToNewsItem = (item: WebSocketNewsItem): NewsItem => {
  try {
    // Use the text field instead of message
    const { headline, source } = extractHeadline(item.text);
    const aiAnalysis = generateMockAiAnalysis(headline);
    
    return {
      id: item.id.toString(),
      title: headline,
      source,
      timestamp: getRelativeTime(item.date),
      summary: headline, // Use headline as summary
      url: "#", // Placeholder URL
      aiAnalysis
    };
  } catch (error) {
    console.error("Error converting news item:", error, item);
    // Return a fallback item
    return {
      id: item.id?.toString() || Math.random().toString(36).substring(2, 9),
      title: item.text?.substring(0, 50) || "Unknown headline",
      source: "Unknown source",
      timestamp: getRelativeTime(item.date || new Date().toISOString()),
      summary: item.text || "No content available",
      url: "#",
      aiAnalysis: {
        sentiment: "neutral",
        marketImpact: "Unable to analyze this news item.",
        relatedSymbols: ["SPY"],
        confidenceScore: 0.5
      }
    };
  }
};

// Update the NewsItem component to have gradient backgrounds based on sentiment

const NewsItem: React.FC<{ news: NewsItem; expanded: boolean; toggleExpand: () => void }> = ({ news, expanded, toggleExpand }) => {
  // Define sentiment-based styles
  const sentimentStyles = {
    positive: {
      textColor: "text-emerald-400",
      badgeStyle: "bg-emerald-900/70 text-emerald-200",
      gradientBg: "bg-gradient-to-r from-emerald-950/90 to-transparent border-l-2 border-emerald-600/50",
      expandedBg: "bg-gradient-to-r from-emerald-950/90 to-gray-900/20 border-l-2 border-emerald-600/50"
    },
    neutral: {
      textColor: "text-blue-400",
      badgeStyle: "bg-blue-900/70 text-blue-200",
      gradientBg: "bg-gradient-to-r from-blue-950/30 to-transparent border-l-2 border-blue-600/50",
      expandedBg: "bg-gradient-to-r from-blue-950/30 to-gray-900/20 border-l-2 border-blue-600/50"
    },
    negative: {
      textColor: "text-rose-400",
      badgeStyle: "bg-rose-900/70 text-rose-200",
      gradientBg: "bg-gradient-to-r from-rose-950/90 to-transparent border-l-2 border-rose-600/50",
      expandedBg: "bg-gradient-to-r from-rose-950/90 to-gray-900/20 border-l-2 border-rose-600/50"
    }
  };
  
  const style = sentimentStyles[news.aiAnalysis.sentiment];
  
  return (
    <div className={`border-b border-gray-800/50 py-5 px-4 ${style.gradientBg} hover:bg-gray-900/10 transition-colors duration-300`}>
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold text-white hover:text-blue-400 cursor-pointer" onClick={toggleExpand}>
          {news.title}
        </h3>
        <span className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${style.badgeStyle}`}>
          {news.aiAnalysis.sentiment.toUpperCase()}
        </span>
      </div>
      
      <div className="flex space-x-3 text-sm text-gray-400 mt-1">
        <span>{news.source}</span>
        <span>•</span>
        <span>{news.timestamp}</span>
      </div>
      
      <p className="mt-3 text-gray-300">{news.summary}</p>
      
      {expanded && (
        <div className={`mt-4 p-4 rounded-lg border border-gray-800/50 ${style.expandedBg}`}>
          <div className="flex items-center space-x-2 mb-3">
            <FaRobot className={style.textColor} />
            <h4 className={`font-semibold ${style.textColor}`}>AI Analysis</h4>
            <span className="text-xs bg-gray-800/70 px-2 py-1 rounded-full">
              {(news.aiAnalysis.confidenceScore * 100).toFixed()}% confidence
            </span>
          </div>
          
          <p className="text-gray-300 mb-3">{news.aiAnalysis.marketImpact}</p>
          
          <div className="mt-3">
            <h5 className="text-sm font-medium text-gray-400 mb-2">Potentially affected symbols:</h5>
            <div className="flex flex-wrap gap-2">
              {news.aiAnalysis.relatedSymbols.map(symbol => (
                <span key={symbol} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-lg text-xs flex items-center">
                  <FaChartLine className="mr-1" size={10} />
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-between items-center">
        <button 
          onClick={toggleExpand}
          className={`text-sm ${style.textColor} hover:brightness-125 flex items-center`}
        >
          {expanded ? "Hide analysis" : "View AI analysis"}
          <FaArrowRight className="ml-1" size={12} />
        </button>
        
        {news.url && news.url !== "#" && (
          <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white">
            Read full story
          </a>
        )}
      </div>
    </div>
  );
};

export default function LiveNewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const socketRef = useRef<WebSocket | null>(null);
  
  // Handle WebSocket connection and data
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        setLoading(true);
        
        // Use the correct WebSocket path - /ws endpoint
        const ws = new WebSocket("ws://localhost:8001/ws");
        
        ws.onopen = () => {
          console.log("WebSocket connected");
          setConnected(true);
          setError(null);
          
          // Send initial "ping" to unblock the receive loop as in your test code
          try {
            ws.send("ping");
          } catch (err) {
            console.warn("Could not send ping message:", err);
          }
        };
        
        ws.onmessage = (event) => {
        try {
          // Debug the raw message
          if (typeof event.data === 'string' && event.data.length < 200) {
            console.debug("Raw WebSocket message:", event.data);
          }
          
          // Parse incoming data
          const data = JSON.parse(event.data);
          
          if (Array.isArray(data)) {
            // Initial batch of headlines
            console.log(`Received ${data.length} headlines from WebSocket`);
            
            // Filter out any invalid items
            const validItems = data.filter(item => item && typeof item === 'object');
            
            // Convert to NewsItem format first, then sort
            const newsItems = validItems.map(convertWebSocketToNewsItem);
            
            // Sort by timestamp (newest first) - sort after conversion
            const sortedItems = [...newsItems].sort((a, b) => {
              const dateA = new Date(a.timestamp.includes('ago') ? 
                Date.now() - parseRelativeTime(a.timestamp) : 
                a.timestamp);
              const dateB = new Date(b.timestamp.includes('ago') ? 
                Date.now() - parseRelativeTime(b.timestamp) : 
                b.timestamp);
              return dateB.getTime() - dateA.getTime();
            });
            
            setNewsItems(sortedItems);
          } else if (data && typeof data === 'object') {
            // Single headline update
            console.log("Received new headline:", data.id);
            const newsItem = convertWebSocketToNewsItem(data);
            
            // Add new item and re-sort the entire array
            setNewsItems(prev => {
              const updated = [newsItem, ...prev];
              // Sort the entire array to maintain proper order
              return updated.sort((a, b) => {
                const dateA = new Date(a.timestamp.includes('ago') ? 
                  Date.now() - parseRelativeTime(a.timestamp) : 
                  a.timestamp);
                const dateB = new Date(b.timestamp.includes('ago') ? 
                  Date.now() - parseRelativeTime(b.timestamp) : 
                  b.timestamp);
                return dateB.getTime() - dateA.getTime();
              });
            });
          } else {
            console.warn("Unexpected WebSocket data format:", data);
          }
          
          setLoading(false);
        } catch (err) {
          console.error("Error processing WebSocket message:", err);
          if (typeof event.data === 'string') {
            console.error("Message that caused error:", event.data.substring(0, 200));
          }
        }
      };
        
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setError("Connection error. Check if the news server is running.");
          setConnected(false);
          setLoading(false);
        };
        
        ws.onclose = (event) => {
          console.log(`WebSocket closed with code ${event.code}`);
          setConnected(false);
          setLoading(false);
          
          // Try to reconnect in 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        socketRef.current = ws;
      } catch (err) {
        console.error("WebSocket connection failed:", err);
        setError("Failed to connect to news server");
        setLoading(false);
        setConnected(false);
        // Try again in 5 seconds
        setTimeout(connectWebSocket, 5000);
      }
    };
    
    // Initial connection attempt
    connectWebSocket();

  const parseRelativeTime = (relativeTime: string): number => {
  const match = relativeTime.match(/(\d+)\s*(min|hours|days)\s*ago/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'min': return value * 60 * 1000;
    case 'hours': return value * 60 * 60 * 1000;
    case 'days': return value * 24 * 60 * 60 * 1000;
    default: return 0;
  }
};
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);
  
  const toggleExpand = (id: string) => {
    setExpandedNews(current => current === id ? null : id);
  };
  
  const filteredNews = filter === "all" 
    ? newsItems 
    : newsItems.filter(news => news.aiAnalysis.sentiment === filter);
  
  return (
    <SymbolProvider>
      <div className="relative min-h-screen bg-gradient-to-b from-slate-950 to-black">
        <header className="relative flex items-center space-x-4 pr-4 md:pr-8 lg:pr-12 py-3 z-50">
          {/* Header blur effect */}
          <div className="absolute w-full h-20 inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20"></div>

          {/* Navbar content */}
          <div className="relative z-10 flex w-full items-center">
            <div className="flex-shrink-0">
              <Logo />
            </div>

            <div className="flex-grow flex justify-center">
              <AnimatedNavbar />
            </div>

            <div className="flex-shrink-0">
              <ThemeSwitcher />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 pt-0 pb-12">
          {/* Page Title */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-5xl font-bold flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-700 mr-3">
                Live News
              </span>
              <span className="text-xl text-blue-500 font-normal">with AI Analysis</span>
            </h1>
            
            <div className="flex items-center">
              {loading && (
                <div className="flex items-center text-blue-400 mr-3">
                  <FaSpinner className="animate-spin mr-2" />
                  <span>Loading...</span>
                </div>
              )}
              
              {!loading && (
                <div className={`flex items-center ${connected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                  <span>{connected ? 'Live' : 'Reconnecting...'}</span>
                </div>
              )}
            </div>
          </div>

          {/* News Container */}
          <div className="relative rounded-none border border-gray-800/50 p-2">
            <GlowingEffect spread={1} glow={true} disabled={false} proximity={1} inactiveZone={0} />
            <div className="relative bg-black/40 backdrop-blur-sm rounded-none p-5 z-10">
              
              {/* Filter tabs */}
              <div className="flex space-x-2 mb-6">
                <button 
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-xs text-sm font-semibold ${
                    filter === "all" ? "bg-[#002861] text-white" : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  All News
                </button>
                <button 
                  onClick={() => setFilter("positive")}
                  className={`px-4 py-2 rounded-xs text-sm font-semibold ${
                    filter === "positive" ? "bg-emerald-900/70 text-emerald-200" : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  Positive
                </button>
                <button 
                  onClick={() => setFilter("negative")}
                  className={`px-4 py-2 rounded-xs text-sm font-semibold ${
                    filter === "negative" ? "bg-rose-900/70 text-rose-200" : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  Negative
                </button>
                <button 
                  onClick={() => setFilter("neutral")}
                  className={`px-4 py-2 rounded-xs text-sm font-semibold ${
                    filter === "neutral" ? "bg-blue-900/70 text-blue-200" : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  Neutral
                </button>
              </div>
              
              {/* News items */}
              <div className="space-y-0">
                {loading && newsItems.length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                    <FaSpinner className="animate-spin text-3xl mb-4" />
                    <p>Connecting to live news feed...</p>
                  </div>
                )}
                
                {error && !loading && newsItems.length === 0 && (
                  <div className="bg-gray-900/50 border border-gray-800/50 p-8 rounded-lg mb-6 flex flex-col items-center">
                    <p className="text-gray-400 text-lg mb-4">Cannot connect to news server</p>
                    <p className="text-gray-500 text-center max-w-md mb-6">{error}</p>
                    <button 
                      onClick={() => {
                        setError(null);
                        setLoading(true);
                        if (socketRef.current) {
                          socketRef.current.close();
                          socketRef.current = null;
                        }
                        setTimeout(() => {
                          const ws = new WebSocket("ws://localhost:8001/ws");
                          socketRef.current = ws;
                          
                          ws.onopen = () => {
                            setConnected(true);
                            setError(null);
                            try { ws.send("ping"); } catch {}
                          };
                          
                          ws.onerror = () => {
                            setError("Connection failed. Is the news server running?");
                            setConnected(false);
                            setLoading(false);
                          };
                        }, 500);
                      }}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg"
                    >
                      Retry Connection
                    </button>
                  </div>
                )}
                
                {!loading && filteredNews.length === 0 && !error && (
                  <div className="text-center py-20 text-gray-400">
                    {filter === "all" 
                      ? "No news headlines available at this time" 
                      : "No news headlines match the selected filter"}
                  </div>
                )}
                
                {filteredNews.map((news) => (
                  <NewsItem 
                    key={news.id} 
                    news={news} 
                    expanded={expandedNews === news.id}
                    toggleExpand={() => toggleExpand(news.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SymbolProvider>
  );
}