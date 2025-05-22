import express from "express";
import cors from "cors";
import { getStockData } from "./services/alphavantage";

const app = express();
const PORT = 5000;

// Enable CORS for frontend-backend communication
app.use(cors());

// API route to fetch stock data
app.get("/api/stocks/:symbol", async (req, res) => {
  const { symbol } = req.params;

  try {
    const data = await getStockData(symbol);
    res.json(data);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});