import puppeteer from "puppeteer";

export async function scrapeNews(symbol: string): Promise<string[]> {
  const url = `https://www.tradingview.com/symbols/${symbol}/news/`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the news page
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Wait for the main container to load
    await page.waitForSelector(".container-lu7Cy9jC", { timeout: 5000 });

    // Extract news headlines and providers
    const news = await page.$$eval(".card-HY0D0owe.card-DmjQR0Aa", (cards) =>
      cards.map((card) => {
        const headline = card
          .querySelector(".title-HY0D0owe")
          ?.textContent?.trim();
        const provider = card
          .querySelector(".provider-HY0D0owe span")
          ?.textContent?.trim();
        return { headline, provider };
      })
    );

    // Filter news to include only Reuters headlines
    const reutersNews = news
      .filter((item) => item.provider === "Reuters")
      .map((item) => item.headline)
      .filter((headline): headline is string => typeof headline === "string");

    return reutersNews;
  } catch (error) {
    console.error("Error scraping news:", error);
    return [];
  } finally {
    await browser.close();
  }
}