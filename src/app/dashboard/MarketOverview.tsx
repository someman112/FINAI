"use client";

import React, { useEffect, useState, useRef } from "react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { FiSearch } from "react-icons/fi"; // Import search icon from react-icons

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function MarketOverview() {
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState("IBM"); // Default stock symbol
  const [inputSymbol, setInputSymbol] = useState("IBM"); // Input field value
  const chartRef = useRef(null); // Reference for the chart to create gradient

  useEffect(() => {
    fetchStockData(symbol);
  }, [symbol]);

  async function fetchStockData(stockSymbol: string) {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/stocks/${stockSymbol}`);
      const data = await response.json();
      setStockData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setLoading(false);
    }
  }

  // Handle search submission
  const handleSearch = () => {
    if (inputSymbol.trim() !== "") {
      setSymbol(inputSymbol.toUpperCase());
    }
  };

  // Handle Enter key press in the input field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle tab click
  const handleTabClick = (stockSymbol: string) => {
    setSymbol(stockSymbol);
    setInputSymbol(stockSymbol); // Update the input field to reflect the selected stock
  };

  // Calculate net gain or loss
  const stockName = symbol.toUpperCase(); // Display the stock symbol as the name
  const timeSeries = stockData?.["Time Series (Daily)"];
  const dates = timeSeries ? Object.keys(timeSeries).slice(0, 10).reverse() : [];
  const closingPrices = timeSeries
    ? dates.map((date) => parseFloat(timeSeries[date]["4. close"]))
    : [];
  const netChange =
    closingPrices.length > 1
      ? closingPrices[closingPrices.length - 1] - closingPrices[0]
      : 0;
  const netChangePercentage =
    closingPrices.length > 1
      ? ((netChange / closingPrices[0]) * 100).toFixed(2)
      : "0.00";

  // Prepare data for the chart
  const chartData = stockData?.["Time Series (Daily)"]
    ? {
        labels: dates, // Last 10 days
        datasets: [
          {
            label: "Closing Price",
            data: closingPrices,
            borderColor: "rgb(0, 162, 255)", // Line color
            backgroundColor: (context: any) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;

              if (!chartArea) {
                return null;
              }

              // Create gradient
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, "rgba(56, 182, 255, 0.3)"); // Light blue at the top
              gradient.addColorStop(1, "rgba(56, 182, 255, 0)"); // Transparent at the bottom
              return gradient;
            },
            fill: true, // Enable gradient fill
            tension: 0.4, // Smooth curve
            pointRadius: 0, // Remove dots
          },
        ],
      }
    : null;

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to resize dynamically
    plugins: {
      legend: {
        display: false, // Remove legend
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `$${context.raw}`, // Add dollar sign to tooltip
        },
      },
    },
    scales: {
      x: {
        display: false, // Remove x-axis labels
        grid: {
          display: false, // Remove grid lines on x-axis
        },
      },
      y: {
        ticks: {
          callback: (value: number) => `$${value}`, // Add dollar sign to y-axis
          color: "rgba(255, 255, 255, 0.7)", // Y-axis label color
        },
        grid: {
          display: false, // Remove grid lines on y-axis
        },
      },
    },
  };

  return (
    <div className="relative rounded-xl">
      <div className="relative rounded-xl border border-gray-800/50 p-2">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-5 z-10">
          {/* Tabs for Common Stocks */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {["AAPL", "META", "MSFT", "AMZN", "GOOGL"].map((stock) => (
              <button
                key={stock}
                onClick={() => handleTabClick(stock)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  symbol === stock
                    ? "bg-[#002861] text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {stock}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-4 flex items-center absolute top-14 left-4 space-x-2">
            <input
              type="text"
              placeholder="Enter a symbol (e.g., AAPL)"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
              onKeyDown={handleKeyPress} // Handle Enter key press
              className="w-full px-4 py-2 pr-10 rounded-lg bg-gradient-to-r from-[#002861] to-[rgba(13, 13, 13, 0.5)] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
            >
              <FiSearch size={20} />
            </button>
          </div>

          {/* Stock Name and Net Change */}
          <div className="absolute top-20 right-4 text-white text-right">
            <h3 className="text-lg font-semibold">{stockName}</h3>
            <p
              className={`text-sm ${
                netChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {netChange >= 0 ? "+" : ""}
              {netChange.toFixed(2)} ({netChangePercentage}%)
            </p>
          </div>

          <h2 className="text-xl font-semibold text-white mb-4">Market Overview</h2>
          <div className="h-80 flex items-center justify-center text-gray-400">
            {loading ? (
              "Loading stock data..."
            ) : chartData ? (
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            ) : (
              "Failed to load stock data"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}