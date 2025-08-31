import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function getSentimentAnalysis(stock: string): Promise<string> {
  try {
    // Call the Python script and pass the stock symbol as an argument
    const { stdout } = await execFileAsync("python", [
      "c:\\Users\\abdul\\Documents\\financial-dashboard\\backend\\services\\modelquery.py",
      stock,
    ]);

    // Log raw output for debugging (optional)
    // console.log("Raw sentiment output from Python script:", stdout);

    // Return the sentiment analysis string (trimmed to remove extra whitespace)
    return stdout.trim();
  } catch (error) {
    console.error("Error fetching sentiment analysis:", error);
    return "Unable to retrieve sentiment analysis at this time.";
  }
}

export async function getMarketSentiment(): Promise<string> {
  try {
    // Call the Python script without stock symbol for general market sentiment
    const { stdout } = await execFileAsync("python", [
      "c:\\Users\\abdul\\Documents\\financial-dashboard\\backend\\services\\modelquery.py",
    ]);

    // Return the market sentiment analysis string
    return stdout.trim();
  } catch (error) {
    console.error("Error fetching market sentiment:", error);
    return "Unable to retrieve market sentiment at this time.";
  }
}