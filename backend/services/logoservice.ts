import puppeteer from "puppeteer";

export async function scrapeLogo(symbol: string): Promise<string | null> {
  const url = `https://www.tradingview.com/symbols/${symbol}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector('img[class*="logo"]', { timeout: 5000 });

    // Extract the logo URL
    const logoUrl = await page.$eval(
      'img[class*="logo"]',
      (element: Element) => (element as HTMLImageElement).src
    );
    return logoUrl; // Return the logo URL
  } catch (error) {
    console.error("Error scraping logo:", error);
    return null; // Return null if scraping fails
  } finally {
    await browser.close(); // Ensure the browser is closed
  }
}