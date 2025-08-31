import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { FaRedo } from 'react-icons/fa';
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Chart as ChartJSInstance,
  ScriptableContext
} from "chart.js";
import "chartjs-adapter-date-fns";
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";

// register core + financial controllers
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

interface Candle { date: Date; open: number; high: number; low: number; close: number; }
interface Limits {
  min: number;
  max: number;
}
interface CandlestickChartProps { 
  data: Candle[]; 
  xLimits?: Limits;
  yLimits?: Limits;
}

export interface ChartRefHandle {
  resetZoom: () => void;
}

const CandlestickChart = forwardRef<ChartRefHandle, CandlestickChartProps>(({ data, xLimits, yLimits }, ref) => {
  const chartRef = useRef<ChartJSInstance<"candlestick"> | null>(null);

  useImperativeHandle(ref, () => ({
    resetZoom: () => {
      if (chartRef.current && (chartRef.current as any).resetZoom) {
        (chartRef.current as any).resetZoom();
      }
    }
  }));

  // Helper for backgroundColor and borderColor
  const upColor = "#4caf50";
  const downColor = "#f44336";
  const upBgColor = "#4caf5077";
  const downBgColor = "#f4433677";

  const chartData = {
    datasets: [
      {
        type: "candlestick" as const,
        maxBarThickness: 10,
        label: "Price",
        data: data.map(d => ({
          x: d.date.getTime(),
          o: d.open,
          h: d.high,
          l: d.low,
          c: d.close,
        })),
        borderColor: (ctx: ScriptableContext<"candlestick">) => {
          const v = ctx.raw as FinancialDataPoint;
          return v.o <= v.c ? upColor : downColor;
        },
        backgroundColor: (ctx: ScriptableContext<"candlestick">) => {
          const v = ctx.raw as FinancialDataPoint;
          return v.o <= v.c ? upBgColor : downBgColor;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: FinancialDataPoint }) => {
            const v = ctx.raw;
            return `O:${v.o}  H:${v.h}  L:${v.l}  C:${v.c}`;
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy" as const,
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "xy" as const,
        },
        limits: {
          x: {
            min: xLimits?.min !== undefined ? 
                xLimits.min - (3 * 24 * 60 * 60 * 1000) :
                Date.parse("2025-01-01"),
            max: xLimits?.max !== undefined ? 
                xLimits.max + (3 * 24 * 60 * 60 * 1000) :
                Date.parse("2025-12-31"),
          },
          y: {
            min: yLimits?.min !== undefined ? yLimits.min * 0.95 : 217.75,
            max: yLimits?.max !== undefined ? yLimits.max * 1.05 : 271,
          },
        },
      },
    },
    scales: {
      x: {
        type: "time" as const,
        display: true,
        time: {
          unit: "day",
          displayFormats: {
            day: 'MMM d'
          }
        },
        ticks: {
          color: "#9EAAC7",
          source: 'data',
          autoSkip: true,
          maxTicksLimit: 10
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        position: 'left' as const,
        ticks: {
          color: "#9EAAC7",
        },
        grid: {
          color: "rgba(56, 62, 85, 0)",
        },
      },
    },
  };

  const handleResetZoom = () => {
    if (chartRef.current && (chartRef.current as any).resetZoom) {
      (chartRef.current as any).resetZoom();
    }
  };

  return (
    <div>
      <Chart
        ref={chartRef}
        type="candlestick"      
        data={chartData}
        options={options}
      />
    </div>
  );
});

CandlestickChart.displayName = "CandlestickChart";

export default CandlestickChart;