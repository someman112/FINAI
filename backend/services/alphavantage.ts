import axios from "axios";

const API_KEY = "demo"; // Use "demo" for testing

export async function getStockData(symbol: string) {
  const url = "https://www.alphavantage.co/query";

  try {
    const response = await axios.get(url, {
      params: {
        function: "TIME_SERIES_DAILY",
        symbol,
        apikey: API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching data from Alpha Vantage:", error);
    throw new Error("Failed to fetch stock data");
  }
}