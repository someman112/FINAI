import cloudscraper
from bs4 import BeautifulSoup
import json
import sys


def fetch_events():
    url = "https://www.forexfactory.com/calendar"
    scraper = cloudscraper.create_scraper()

    scraper.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/136.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.forexfactory.com/",
    })

    resp = scraper.get(url)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # Try grabbing rows directly
    rows = soup.select("tr.calendar__row[data-event-id]")
    if not rows:
        raise RuntimeError("No event rows found — page structure may have changed or you're being blocked.")

    events = []
    date = None
    time = None
    for row in rows:
        def text_or_blank(sel):
            el = row.select_one(sel)
            return el.get_text(strip=True) if el else ""

        if (curr_date := text_or_blank("td.calendar__date")) != '':
            date = curr_date
            date = date[0:3] + " " + date[3:]

        if (curr_time := text_or_blank("td.calendar__time")) != '':
            time = curr_time

        # Extract impact level from the impact cell
        impact = 'Low'  # Default impact level
        impact_span = row.select_one('td.calendar__impact span.icon')
        if impact_span:
            title = impact_span.get('title', '')
            class_name = impact_span.get('class', '')

            if 'High Impact' in title:
                impact = 'High'
            elif 'Medium Impact' in title:
                impact = 'Medium'
            elif 'Low Impact' in title:
                impact = 'Low'
            elif 'Holiday' in title:
                impact = 'Holiday'
            else:
                # Fallback to class name
                if any('red' in c for c in class_name):
                    impact = 'High'
                elif any('ora' in c for c in class_name):
                    impact = 'Medium'
                elif any('yel' in c for c in class_name):
                    impact = 'Low'
                elif any('gra' in c for c in class_name):
                    impact = 'Holiday'

        events.append({
            "date": date,
            "time": time,
            "currency": text_or_blank("td.calendar__currency"),
            "event": text_or_blank("span.calendar__event-title"),
            "impact": impact,
            "actual": text_or_blank("td.calendar__actual"),
            "forecast": text_or_blank("td.calendar__forecast"),
            "previous": text_or_blank("td.calendar__previous"),
        })

    return events


if __name__ == "__main__":
    try:
        # Print as proper JSON for Node.js to parse
        print(json.dumps(fetch_events()))
    except Exception as e:
        # Print error message as JSON for consistent parsing
        print(json.dumps({"error": str(e)}))
        sys.exit(1)