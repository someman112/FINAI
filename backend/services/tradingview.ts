import { connect, getCandles } from "tradingview-ws";

type TradingviewTimeframe = number | '1D' | '1W' | '1M';

export async function getStockData(symbol: string, timeframe: TradingviewTimeframe = "1D", amount: number = 100) {
  try {
    // Establish a connection to TradingView WebSocket
    const connection = await connect();

    // Fetch candlestick data for the given symbol
    const candles = await getCandles({
      connection,
      symbols: [symbol],
      amount,
      timeframe,
    });

    // Close the connection after fetching data
    await connection.close();

    // Return the fetched candles for the symbol
    return candles[0]; // The first element corresponds to the requested symbol
  } catch (error) {
    console.error("Error fetching data from TradingView WebSocket:", error);
    throw new Error("Failed to fetch stock data");
  }
}