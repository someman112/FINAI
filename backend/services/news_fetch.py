import sys
import json
from finvizfinance.quote import finvizfinance

def fetch_news(stock_symbol):
    stock = finvizfinance(stock_symbol)
    news_df = stock.ticker_news()

    # Convert Timestamp objects to strings
    news_df['Date'] = news_df['Date'].astype(str)

    news_list = news_df.to_dict(orient="records")
    return news_list

if __name__ == "__main__":
    stock_symbol = sys.argv[1]  # Get the stock symbol from the command-line arguments
    news = fetch_news(stock_symbol)
    print(json.dumps(news))  # Output the news as JSON