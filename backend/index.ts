import express from "express";
import cors from "cors";
import { getStockData } from "./services/tradingview";
import { TradingviewTimeframe } from "tradingview-ws"; // Import the type
import { scrapeLogo } from "./services/logoservice"; // Import the logo scraping function
import { scrapeNews } from "./services/NewsService";
import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

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

app.get("/api/sentiment", async (req, res) => {
  const { symbol } = req.query;

  try {
    // Set headers for Server-Sent Events (SSE)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Spawn Python process
    const args = symbol && typeof symbol === 'string' 
      ? ['c:\\Users\\abdul\\Documents\\financial-dashboard\\backend\\services\\modelquery.py', symbol]
      : ['c:\\Users\\abdul\\Documents\\financial-dashboard\\backend\\services\\modelquery.py'];
    
    const pythonProcess = spawn('python', args);

    // Stream data as it comes from Python
    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    // Handle errors
    pythonProcess.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
      res.write(`data: ${JSON.stringify({ error: data.toString() })}\n\n`);
      res.end();
    });

    // Handle client disconnect
    req.on('close', () => {
      pythonProcess.kill();
    });

  } catch (error) {
    console.error("Error in sentiment streaming:", error);
    res.status(500).json({ error: "Failed to fetch sentiment analysis" });
  }
});

const execPromise = promisify(exec);

async function fetchEventsWithPython() {
  try {
    // Path to the Python script (adjust if needed)
    const scriptPath = path.join(__dirname, 'services', 'calendar_fetch.py');

    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script not found at: ${scriptPath}`);
    }

    console.log('Executing Python script to fetch economic events...');
    
    // Execute the Python script
    const { stdout, stderr } = await execPromise(`python "${scriptPath}"`);
    
    if (stderr) {
      console.error('Python script stderr:', stderr);
    }
    console.log('Python script stdout:', stdout);
    
    // Parse the output
    const events = JSON.parse(stdout);
    
    // Check if the script returned an error
    if (events.error) {
      throw new Error(`Python script error: ${events.error}`);
    }
    
    return events;
  } catch (error) {
    console.error('Error executing Python script:', error);
    throw error;
  }
}

// Define the type for the events returned by the Python script
interface EconomicEvent {
  event: string;    
  currency: string; 
  date: string;
  time: string;     
  impact: string;
  forecast: string;
  previous: string;
  actual: string;
}

app.get('/api/economic-events', async (_req, res) => {
  try {
    // Fetch events and return them directly without any transformation
    const events: EconomicEvent[] = await fetchEventsWithPython();
    console.log('Fetched economic events from Python script:', events.length);
    
    // Return the raw data as-is
    return res.json(events);
    
  } catch (err) {
    console.error('Error fetching economic events:', err);
    
    // Try the fallback API if Python fails
    try {
      console.log('Trying fallback direct API...');
      const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const events = await response.json();
      return res.json(events);
    } catch (fallbackErr) {
      console.error('Fallback API also failed:', fallbackErr);
      return res.status(500).json({ error: 'Failed to fetch economic events via all methods' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});