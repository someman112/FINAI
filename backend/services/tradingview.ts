import { connect, getCandles } from "tradingview-ws";

type TradingviewTimeframe = number | '1D' | '1W' | '1M';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class TradingViewService {
  constructor() {}

  // For chart data - fetches historical data and closes connection
  async getChartData(symbol: string, timeframe: TradingviewTimeframe = "1D", amount: number = 100): Promise<CandleData[]> {
    try {
      // Create a temporary connection for chart data
      const tempConnection = await connect();

      const candles = await getCandles({
        connection: tempConnection,
        symbols: [symbol],
        amount,
        timeframe,
      });

      // Close the temporary connection
      await tempConnection.close();

      // Map the candles to match CandleData interface
      const mappedCandles = (candles[0] || []).map((candle: any) => ({
        time: candle.timestamp || candle.time || Date.now(),
        open: candle.open || 0,
        high: candle.high || 0,
        low: candle.low || 0,
        close: candle.close || 0,
        volume: candle.volume || 0
      }));

      return mappedCandles;
    } catch (error) {
      console.error("Error fetching chart data from TradingView:", error);
      return [];
    }
  }
}

// Create a singleton instance
const tradingViewService = new TradingViewService();

// Export the service
export { tradingViewService };

// Backwards compatible function for chart data
export async function getStockData(symbol: string, timeframe: TradingviewTimeframe = "1D", amount: number = 100): Promise<CandleData[]> {
  return tradingViewService.getChartData(symbol, timeframe, amount);
}