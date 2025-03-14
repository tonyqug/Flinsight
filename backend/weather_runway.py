import requests
from datetime import datetime
from dotenv import load_dotenv
import os

env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")

# Load environment variables from .env.local
load_dotenv(env_path)
api_key = os.environ.get("METAR_API_KEY", "your-api-key")

def get_metar_avwx(station, token = api_key):
    """
    Fetches the METAR for a given station (e.g., KJFK or EGLL) using the AVWX REST API.
    Returns the parsed JSON data or None if there's an error.
    """
    url = f"https://avwx.rest/api/metar/{station}"
    params = {"token": token}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    response = requests.get(url, params=params, headers=headers)
    if response.status_code != 200:
        print(f"Error fetching data for {station} (HTTP {response.status_code})")
        return None
    try:
        data = response.json()
    except Exception as e:
        print(f"Error parsing JSON for {station}: {e}")
        return None
    return data

def extract_runway_conditions(raw_text):
    """
    Attempts to extract runway condition details from the raw METAR text.
    Looks for the keyword "rwy" (case-insensitive) and returns a snippet.
    """
    if not raw_text:
        return None
    lower_text = raw_text.lower()
    idx = lower_text.find("rwy")
    if idx != -1:
        # Extract a snippet of 50 characters starting at the found keyword.
        snippet = raw_text[idx:idx+50]
        return snippet.strip()
    return None

def main():
    # Replace with your AVWX REST API token
    
    airports = ["KJFK", "BIRK"]
    
    for airport in airports:
        print(f"\nFetching METAR for {airport}...")
        metar_data = get_metar_avwx(airport)
        if metar_data:
            # Extract key data from the JSON response
            raw_metar = metar_data.get("raw", "N/A")
            observation_time = metar_data.get("time", {}).get("dt", "N/A")
            temperature = metar_data.get("temperature", {}).get("value", "N/A")
            wind_speed = metar_data.get("wind_speed", {}).get("value", "N/A")
            wind_dir = metar_data.get("wind_direction", {}).get("value", "N/A")
            visibility = metar_data.get("visibility", {}).get("value", "N/A")
            
            # Print out the METAR details
            print(f"METAR for {airport}:")
            print(f"  Observation Time: {observation_time}")
            print(f"  Temperature (C): {temperature}")
            print(f"  Wind: {wind_dir}° at {wind_speed} kt")
            print(f"  Visibility: {visibility}")
            print(f"  Raw METAR: {raw_metar}")
            
            # Extract and display runway condition information (if available)
            runway_info = extract_runway_conditions(raw_metar)
            if runway_info:
                print("  Runway Conditions (snippet):")
                print(f"    {runway_info}")
            else:
                print("  No runway condition info found.")
        else:
            print(f"No METAR data for {airport}.")

if __name__ == "__main__":
    main()
