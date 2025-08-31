from ollama import chat
from finvizfinance.news import News
import sys

stock_symbol = sys.argv[1] if len(sys.argv) > 1 else None

if stock_symbol:
    try:
        from finvizfinance.quote import finvizfinance
        stock = finvizfinance(stock_symbol)
        stock_news = stock.ticker_news()
        headlines = [item[0] for item in stock_news if item[0]]  # Extract titles
        context = f"stock {stock_symbol}"
    except:
        fnews = News().get_news()
        headlines = [i for i in fnews['news']['Title']]
        context = "overall market"
else:
    fnews = News().get_news()
    headlines = [i for i in fnews['news']['Title']]
    context = "overall market"

# Join all headlines into a single string
headlines_text = "\n".join([f"- {h}" for h in headlines])

# Full prompt with all headlines
prompt = f"""
You are a financial analyst. Derive an {context} sentiment to give the investor a feel on the state of the markets based
on the following headlines. Your response will be displayed on a financial webapp with specific formatting.

IMPORTANT: Follow this EXACT format structure:

**Market Environment:** [One clear sentence describing the current market state]

[2-3 sentences expanding on the market environment with key details]

**Key Headlines Analysis:**

- **Strong Bullish/[Theme]:** [Analysis of bullish indicators]

- **Cautious Bullish/[Theme]:** [Analysis of cautiously positive signals] 

- **Neutral/Uncertain/[Theme]:** [Analysis of mixed or unclear signals]

- **Cautious Bearish/[Theme]:** [Analysis of concerning developments]

- **Strong Bearish/[Theme]:** [Analysis of very negative indicators]

**Overall Sentiment:** [Final 1-2 sentence summary of the market outlook]

Headlines:
{headlines_text}

When analyzing, focus on these factors:
1. Market Sentiment: Strong Bullish, Cautious Bullish, Neutral/Uncertain, Cautious Bearish, Strong Bearish
2. Major Macro Themes: Macro Optimism, Macro Fear, Earnings Strength/Weakness, Policy Catalysts, Liquidity Shifts, Sector Rotation, Momentum/Speculation, Flight to Safety
3. Geographic/Sector Focus: Specific regions or sectors driving movement

Use the bullet point format with bold headers exactly as shown above. Only include sentiment categories that are relevant to the current headlines.
"""

# Call DeepSeek model with streaming output
stream = chat(
    model='deepseek-r1',
    messages=[{'role': 'user', 'content': prompt}],
    stream=True,
    think=False,
)

# Stream and print response in real-time
for chunk in stream:
    print(chunk['message']['content'], end='', flush=True)
