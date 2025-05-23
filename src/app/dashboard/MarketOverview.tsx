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
import { FiSearch } from "react-icons/fi"; 
import { CrosshairPlugin } from "chartjs-plugin-crosshair";
import { hover } from "motion/react";

ChartJS.register(CrosshairPlugin);

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function MarketOverview() {
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState("IBM"); 
  const [inputSymbol, setInputSymbol] = useState("IBM"); 
  const chartRef = useRef(null); 
  const [logoUrl, setLogoUrl] = useState<string | null>(null); 


  useEffect(() => {
    fetchStockData(symbol);
    fetchStockLogo(symbol); 
  }, [symbol]);

async function fetchStockData(stockSymbol: string) {
  setLoading(true);
  try {
    const response = await fetch(`http://localhost:5000/api/stocks/${stockSymbol}`);
    const data = await response.json();

    const closePrices = data
      .map((item: any) => {
        if (item && item.close !== undefined) {
          return item.close; 
        } else {
          console.warn("Malformed data item:", item); 
          return null; 
        }
      })
      .filter((price: number | null) => price !== null); 

    const timestamps = data
      .map((item: any) => {
        if (item && item.timestamp !== undefined) {
          return new Date(item.timestamp * 1000).toLocaleDateString(); 
        } else {
          console.warn("Malformed data item:", item); 
          return null; 
        }
      })
      .filter((timestamp: string | null) => timestamp !== null); 

    setStockData({ closePrices, timestamps });
    setLoading(false);
  } catch (error) {
    console.error("Error fetching stock data:", error);
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

  // Prepare data for the chart
  const chartData = stockData
    ? {
        labels: stockData.timestamps, // Use timestamps as labels
        datasets: [
          {
            label: "Closing Price",
            data: stockData.closePrices, // Use close prices for the chart
            borderColor: "rgb(0, 162, 255)", // Line color
            borderWidth: 3, // Line width
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
            hoverRadius: 5, // Increase hover radius
          },
        ],
      }
    : null;
let curr_month: string | null;
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // Allow the chart to resize dynamically
    interaction: {
    mode: "nearest", // Snap to the nearest data point
    axis: "x", // Interaction is limited to the x-axis
    intersect: false, // Allow hovering even if not directly over a data point
  },
  plugins: {
    legend: {
      display: false, // Remove legend
    },
    tooltip: {
      callbacks: {
        // Customize tooltip to show date and price
        title: (tooltipItems: any) => {
          const index = tooltipItems[0]?.dataIndex; // Safely access dataIndex
          if (stockData && stockData.timestamps && index !== undefined) {
            return stockData.timestamps[index]; // Show the date
          }
          return ""; // Fallback if data is missing
        },
        label: (tooltipItem: any) => {
          if (tooltipItem.raw !== undefined) {
            return `$${tooltipItem.raw.toFixed(2)}`; // Show the price
          }
          return ""; // Fallback if raw data is missing
        },
      },
    },
    crosshair: {
      line: {
        color: "rgba(255, 255, 255, 0)", // Crosshair line color
        width: 0, // Crosshair line width
      },
      sync: {
        enabled: false, // Disable syncing with other charts
      },
      zoom: {
        enabled: false, // Disable zooming
      },
      snap: {
        enabled: true, // Snap to data points
      },
    },
  },
  scales: {
    x: {
      display: true, // Show x-axis labels
      grid: {
        display: false, // Remove grid lines on x-axis
      },
      ticks: {
        callback: (value: number, index: number) => {
          if (stockData && stockData.timestamps) {
            const date = new Date(stockData.timestamps[index]);
            if (date.toDateString().split(" ")[1] !== curr_month) {
              curr_month = date.toDateString().split(" ")[1];
              return curr_month.toUpperCase();
            }
            else{
              return date.toDateString().split(" ")[2]; // Show day of the month
            }
          }
          return ""; // No label for other days
        },
        color: "rgba(255, 255, 255, 0.7)", // X-axis label color
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
          <div className="mb-8 flex items-center absolute top-14 left-4 space-x-2">
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

          <h2 className="text-xl font-semibold text-white mb-4">Market Overview</h2>
          <div className="mt-15 h-80 flex items-center justify-center text-gray-400">
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