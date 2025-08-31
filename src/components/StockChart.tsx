import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
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
  TimeScale,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import CrosshairPlugin from "chartjs-plugin-crosshair";
import zoomPlugin from "chartjs-plugin-zoom";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  Filler,
  CrosshairPlugin
);

// --- added prop-types ---
interface Limits { min: number; max: number; }
interface LineChartProps {
  data: { date: Date; close: number }[];
  xLimits?: Limits;
  yLimits?: Limits;
}

export interface ChartRefHandle {
  resetZoom: () => void;
}

const LineChart = forwardRef<ChartRefHandle, LineChartProps>(function LineChart({ data, xLimits, yLimits }, ref) {
  const chartRef = useRef<ChartJS | null>(null);

  useImperativeHandle(ref, () => ({
    resetZoom: () => {
      if (chartRef.current) {
        chartRef.current.resetZoom();
      }
    }
  }));

  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.date.toISOString()),
  datasets: [
    {
      data: data.map((d) => d.close),
      borderColor: "#1176e2",
      // draw a gradient from semi-opaque at top to almost transparent at bottom
      backgroundColor: (ctx: { chart: ChartJS }) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) {
          // chartArea not yet initialized
          return 'rgba(6,130,255,0.3)';
        }
        const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        grad.addColorStop(0, 'rgba(6, 131, 255, 0.25)');
        grad.addColorStop(1, 'rgba(6, 131, 255, 0)');
        return grad;
      },
      fill: "start",
      tension: 0.4,
    },
  ],
    }),
    [data]
  );

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "top" as const,
        labels: {
          color: "#ffffff",
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: import("chart.js").TooltipItem<"line">) => `$${(context.raw as number).toFixed(2)}`,
        },
      },
    crosshair: {
      line: {
        color: "#48F",
        width: 1,
      },
      sync: {
        enabled: true,
        group: 1,
        suppressTooltips: false,
      },
      zoom: {
        enabled: true,
        zoomboxBackgroundColor: "rgba(66,133,244,0.2)",
        zoomboxBorderColor: "#48F",
        zoomButtonText: "Reset Zoom",
        zoomButtonClass: "reset-zoom",
      },
      snap: {
        enabled: true,
      },
      callbacks: {
        beforeZoom: () => {
          return true;
        },
        afterZoom: () => {
          return true;
        },
      },
    },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "xy",
        },
        // --- use passed-in limits or fall back to your defaults ---
        limits: {
          x: {
            min: xLimits?.min !== undefined ? 
                xLimits.min - (3 * 24 * 60 * 60 * 1000) : // subtract 3 days in milliseconds
                Date.parse("2025-01-01"),
            max: xLimits?.max !== undefined ? 
                xLimits.max + (3 * 24 * 60 * 60 * 1000) : // add 3 days in milliseconds
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
        type: "time",
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
        ticks: {
          color: "#9EAAC7",
        },
        grid: {
          color: "rgba(56, 62, 85, 0)",
        },
      },
    },
  }), [xLimits, yLimits]);

  return (
    <div>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
});

export default React.memo(LineChart);