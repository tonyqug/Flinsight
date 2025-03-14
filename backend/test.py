import requests
from bs4 import BeautifulSoup

def fetch_and_parse_regulations(url):
    try:
        # Send the GET request
        response = requests.get(url)
        
        # Check if the request was successful (status code 200)
        if response.status_code != 200:
            print(f"Error: Failed to fetch data. Status code: {response.status_code}")
            print(f"Response Content: {response.text[:500]}")  # Print out the HTML content for debugging
            return []

        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract regulation data
        regulations = []

        # Find all the regulation sections (assuming the regulation data is inside <section> tags)
        # You will need to adjust the class/ID selectors based on the actual structure of the HTML.
        sections = soup.find_all('div', class_='section')  # Adjust this to the actual class/ID

        for section in sections:
            regulation = {}
            idtitle = section.find('h4').text.strip() 
            # Extract relevant data from each section
            regulation['id'] = idtitle.split(" ")[1]  # Extract ID
            regulation['title'] = " ".join(idtitle.split(" ")[2:])  # Extract title after the first word
            
            # Assuming content is in <p> or <div> tags
            content = [p.text.strip() for p in section.find_all(['div'])]
            regulation['content'] = "\n".join(content)

            # Assuming the category is 'regulation' (you can modify if it's dynamic)
            regulation['category'] = "regulation"
            
            # Extracting the date (Assuming the date is in a <span> or other specific class)
            citation_tag = section.find(class_="citation")
            if citation_tag:
                date_text = citation_tag.text.strip()
                # Assuming you want the last 3 words in the citation (date-related)
                regulation['date'] = clean_and_convert_date(" ".join(date_text.split()[-3:]))
            else:
                regulation['date'] = "Unknown"
            # Add regulation to the list
            regulations.append(regulation)

        return regulations

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from eCFR: {e}")
        return []
    
from datetime import datetime
import re

def clean_and_convert_date(date_str):
    # Remove any unwanted characters (like the closing bracket) and extra spaces
    date_str = re.sub(r'[^\w\s,]', '', date_str).strip()

    # Try to parse both formats: with abbreviated month and full month name
    try:
        # First try full month name format
        date_obj = datetime.strptime(date_str, "%B %d, %Y")
    except ValueError:
        try:
            # If that fails, try abbreviated month format
            date_obj = datetime.strptime(date_str, "%b %d, %Y")
        except ValueError as e:
            print(f"Error parsing date: {e}")
            return None

    # Return the date in the format YYYY-MM-DD
    return date_obj.strftime("%Y-%m-%d")

if __name__ == "__main__":
    # Example usage
    url = 'https://www.ecfr.gov/api/renderer/v1/content/enhanced/2025-03-12/title-14?chapter=I&subchapter=G&part=135'
    regulations = fetch_and_parse_regulations(url)
    for regulation in regulations:
        print(f"ID: {regulation['id']}, Title: {regulation['title']}, Content: {regulation['content']}")
    print(regulations)