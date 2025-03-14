import requests

def fetch_latest_part135_regulations():
    base_url = "https://www.federalregister.gov/api/v1/documents.json"
    
    params = {
        "conditions[cfr][title]": 14,  # Title 14 for Aeronautics and Space
        "conditions[cfr][part]": 135,  # Part 135 for Charter Operations
        "order": "newest",  # Sort by newest
        "per_page": 10  # Limit results
    }

    response = requests.get(base_url, params=params)

    if response.status_code == 200:
        data = response.json()
        return data.get("results", [])  # Extract regulation results
    else:
        print(f"Error fetching regulations (HTTP {response.status_code})")
        return None

# Fetch and display results
latest_regulations = fetch_latest_part135_regulations()
if latest_regulations:
    for reg in latest_regulations:
        print(f"Title: {reg['title']}")
        print(f"Publication Date: {reg['publication_date']}")
        print(f"URL: {reg['html_url']}")
        print("-" * 80)
else:
    print("No recent Part 135 regulations found.")
