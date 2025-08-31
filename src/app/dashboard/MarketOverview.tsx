"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { FiSearch } from "react-icons/fi";
import { useSymbol } from "@/context/SymbolContext";
import LineChart from "@/components/StockChart";
import CandlestickChart from "@/components/CandlestickChart";
import lineIcon from "@/assets/line-icon.png";
import candleIcon from "@/assets/candlestick-icon.png";
import { FaRedo } from "react-icons/fa";

export default function MarketOverview() {
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { symbol, setSymbol } = useSymbol();
  const [inputSymbol, setInputSymbol] = useState(symbol);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const chartContainerRef = useRef<HTMLDivElement>(null);

const chartData = useMemo(() => {
  if (!stockData) return [];
  return stockData.timestamps.map((timestamp: number, i: number) => ({
    date: new Date(timestamp),
    open: stockData.open[i],
    high: stockData.high[i],
    low: stockData.low[i],
    close: stockData.closePrices[i],
    volume: stockData.volume?.[i] ?? 0,
  }));
}, [stockData]);

  const { xLimits, yLimits } = useMemo(() => {
    if (chartData.length === 0) {
      return { xLimits: undefined, yLimits: undefined };
    }
    const times = chartData.map(d => d.date.getTime());
    const prices = chartData.map(d => d.close);
    return {
      xLimits: { min: Math.min(...times), max: Math.max(...times) },
      yLimits: { min: Math.min(...prices), max: Math.max(...prices) },
    };
  }, [chartData]);

  useEffect(() => {
    fetchStockData(symbol);
    fetchStockLogo(symbol);
  }, [symbol]);

async function fetchStockData(stockSymbol: string) {
  setLoading(true);
  try {
    const response = await fetch(`http://localhost:5000/api/stocks/${stockSymbol}`);
    const data = await response.json();

    console.log("Raw API response:", data); // Add this to debug

    // Updated data processing to handle both timestamp and time properties
    const processedData = data
      .map((item: any) => {
        if (!item) return null;
        
        const timestamp = item.timestamp || item.time;
        if (!timestamp || item.close === undefined) return null;
        
        return {
          timestamp: timestamp * (timestamp < 1e12 ? 1000 : 1), // Convert to milliseconds if needed
          close: item.close,
          open: item.open ?? item.close,
          high: item.high ?? item.close,
          low: item.low ?? item.close,
          volume: item.volume ?? 0
        };
      })
      .filter((item: any) => item !== null)
      .sort((a: any, b: any) => a.timestamp - b.timestamp); // Sort by timestamp

    if (processedData.length === 0) {
      console.warn("No valid data points found");
      setStockData(null);
      setLoading(false);
      return;
    }

    // Extract arrays for backward compatibility
    const timestamps = processedData.map((item: any) => item.timestamp);
    const closePrices = processedData.map((item: any) => item.close);
    const open = processedData.map((item: any) => item.open);
    const high = processedData.map((item: any) => item.high);
    const low = processedData.map((item: any) => item.low);
    const volume = processedData.map((item: any) => item.volume);

    setStockData({ closePrices, open, high, low, timestamps, volume });
    setLoading(false);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    setStockData(null);
    setLoading(false);
  }
}

  async function fetchStockLogo(stockSymbol: string) {
    try {
      const response = await fetch(`http://localhost:5000/api/logo/${stockSymbol}`);
      const data = await response.json();
      setLogoUrl(data.logoUrl);
    } catch (error) {
      console.error("Error fetching stock logo:", error);
      setLogoUrl(null);
    }
  }

  const handleSearch = () => {
    if (inputSymbol.trim() !== "") {
      setSymbol(inputSymbol.toUpperCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleTabClick = (stockSymbol: string) => {
    setSymbol(stockSymbol);
    setInputSymbol(stockSymbol);
  };

  const lineChartRef = useRef<{ resetZoom: () => void }>(null);
  const candlestickChartRef = useRef<{ resetZoom: () => void }>(null);

  const handleResetZoom = () => {
    if (chartType === 'line' && lineChartRef.current) {
      lineChartRef.current.resetZoom();
    } else if (chartType === 'candlestick' && candlestickChartRef.current) {
      candlestickChartRef.current.resetZoom();
    }
  };

  return (
    <div className="relative rounded-none">
      <div className="relative rounded-none border border-gray-800/50 p-2">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="relative bg-black/40 backdrop-blur-sm rounded-none p-5 z-10">
          {/* Tabs for Common Stocks */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {["AAPL", "META", "MSFT", "AMZN", "GOOGL"].map((stock) => (
              <button
                key={stock}
                onClick={() => handleTabClick(stock)}
                className={`px-3 py-1 rounded-xs text-sm font-semibold ${
                  symbol === stock
                    ? "bg-[#002861] text-white"
                    : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                }`}
              >
                {stock}
              </button>
            ))}
          </div>
          {/* Search Bar */}
          <div className="mb-8 flex items-center absolute top-14 left-4 space-x-2">
            <input
              type="text"
              placeholder="Enter a symbol (e.g., AAPL)"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
              onKeyDown={handleKeyPress}
              className="w-full px-4 py-2 pr-10 rounded-xs bg-gradient-to-r from-[#002861] to-[rgba(13, 13, 13, 0.5)] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
            >
              <FiSearch size={20} />
            </button>
          </div>
          <div className="absolute top-13 right-4 text-white text-right">
            <div className="flex items-center space-x-2">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={`${symbol} logo`}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <h3 className="text-lg font-semibold">{symbol.toUpperCase()}</h3>
            </div>
            {!loading && stockData && stockData.closePrices.length > 0 && (
              <p className="text-md text-gray-300">
                ${stockData.closePrices[stockData.closePrices.length - 1].toFixed(2)}
              </p>
            )}
          </div>

          <h2
            className="font-bold text-lg text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(to left, rgb(255, 255, 255) 90%, #1976d2 100%)",
            }}
          >
            Market Overview
          </h2>
          <div
            className="mt-15 h-full w-full text-gray-400"
            ref={chartContainerRef}
          >
            {loading ? (
              "Loading stock data..."
            ) : (
              chartData.length > 0 && (
                          <>
            {chartType === "line" ? (
              <LineChart ref={lineChartRef} data={chartData} xLimits={xLimits} yLimits={yLimits} />
            ) : (
              <CandlestickChart ref={candlestickChartRef} data={chartData} xLimits={xLimits} yLimits={yLimits}/>
            )}
          </>
              )
            )}
          </div>
          <div className="mt-4 flex w-full justify-between items-center">
            {/* Left side - Reset zoom button */}
            <div>
              <button
                onClick={handleResetZoom}
                className="px-2 py-2 bg-gray-900 text-white rounded-xs hover:bg-gray-800"
                aria-label="Reset Zoom"
              >
                <FaRedo className="h-4 w-4" />
              </button>
            </div>

            {/* Right side - Chart type buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 rounded-xs text-sm font-semibold ${
                  chartType === "line"
                    ? "bg-[#002861] text-white"
                    : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                }`}
              >
                <img
                  src={lineIcon.src ?? lineIcon}
                  alt="Line chart"
                  className="w-5 h-5"
                />
              </button>
              <button
                onClick={() => setChartType("candlestick")}
                className={`px-3 py-1 rounded-xs text-sm font-semibold ${
                  chartType === "candlestick"
                    ? "bg-[#002861] text-white"
                    : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                }`}
              >
                <img
                  src={candleIcon.src ?? candleIcon}
                  alt="Candlestick chart"
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}