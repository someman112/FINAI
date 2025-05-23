import express from "express";
import cors from "cors";
import { getStockData } from "./services/tradingview";
import { TradingviewTimeframe } from "tradingview-ws"; // Import the type
import { scrapeLogo } from "./services/logoservice"; // Import the logo scraping function
import { scrapeNews } from "./services/newsservice";

const app = express();
const PORT = 5000;

// Enable CORS for frontend-backend communication
app.use(cors());

// API route to fetch stock data
app.get("/api/stocks/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const timeframe = (req.query.timeframe as string || "1D") as TradingviewTimeframe; // Cast to TradingviewTimeframe
  const amount = parseInt(req.query.amount as string, 10) || 100; // Default to 100 if not provided

  try {
    // Validate the timeframe and amount
    const validTimeframes: TradingviewTimeframe[] = ["1D", "1W", "1M", 60, 240]; // Add other valid timeframes if needed
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({ error: "Invalid timeframe" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Fetch stock data
    const data = await getStockData(symbol, timeframe, amount);
    res.json(data);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

// API route to fetch logo
app.get("/api/logo/:symbol", async (req, res) => {
  const { symbol } = req.params;

  try {
    // Scrape the logo URL
    const logoUrl = await scrapeLogo(symbol);
    if (logoUrl) {
      res.json({ logoUrl });
    } else {
      res.status(404).json({ error: "Logo not found" });
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
    res.status(500).json({ error: "Failed to fetch logo" });
  }
});

app.get("/api/news/:symbol", async (req, res) => {
  const { symbol } = req.params;

  try {
    const news = await scrapeNews(symbol);
    res.json({ news });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});