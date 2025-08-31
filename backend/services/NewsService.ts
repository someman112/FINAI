import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function scrapeNews(stock: string): Promise<{ time: string; headline: string; source: string; link: string }[]> {
  try {
    // Call the Python script and pass the stock symbol as an argument
    const { stdout } = await execFileAsync("python", [
      "c:\\Users\\abdul\\Documents\\financial-dashboard\\backend\\services\\news_fetch.py",
      stock,
    ]);

    // Log raw output for debugging
    // console.log("Raw output from Python script:", stdout);

    // Parse the JSON output from the Python script
    const news = JSON.parse(stdout);

    // Define a list of trusted sources
    const trustedSources = ["reuters", "bloomberg", "cnbc tv", "yahoo finance"];

    // Filter news based on trusted sources
    const filteredNews = news.filter((item: any) =>
      trustedSources.some((source) => item.Source?.toLowerCase().includes(source))
    );

    // Map the filtered news data to match the expected structure
    return filteredNews.map((item: any) => ({
      time: item.Date || "",
      headline: item.Title || "",
      source: item.Source || "",
      link: item.Link || "",
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}