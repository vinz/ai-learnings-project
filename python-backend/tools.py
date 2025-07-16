import json
import random
import requests
from bs4 import BeautifulSoup
from agents import function_tool


@function_tool
def select_random_topic() -> str:
    """
    Selects a random topic from the provided AI terms list.

    Args:
        None

    Returns:
        str: Selected topic.
    """
    with open("aiTerms.json", "r") as file:
        ai_terms = json.load(file)
    print("Selecting a random topic from AI terms...")
    topic = random.choice(ai_terms)
    print(f"Selected topic: {topic}")
    return topic


@function_tool
def fetch_and_clean_rss_feed() -> str:
    """
    Fetches an RSS feed from a hardcoded URL and removes description tags to reduce size.

    Returns:
        str: The cleaned RSS feed content as a string.
    """
    RSS_URL = "https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKSlRpZ0FQAQ/sections/CAQiR0NCQVNMd29JTDIwdk1EZGpNWFlTQldWdUxVZENHZ0pKVGlJTkNBUWFDUW9ITDIwdk1HMXJlaW9KRWdjdmJTOHdiV3Q2S0FBKi4IACoqCAoiJENCQVNGUW9JTDIwdk1EZGpNWFlTQldWdUxVZENHZ0pKVGlnQVABUAE?hl=en-IN&gl=IN&ceid=IN%3Aen"

    response = requests.get(RSS_URL)
    response.raise_for_status()
    rss_content = response.text

    soup = BeautifulSoup(rss_content, "xml")
    for desc in soup.find_all("description"):
        desc.decompose()

    return str(soup)
