from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import requests
from datetime import datetime, timedelta
import xml.etree.ElementTree as ET
import re
from dotenv import load_dotenv
from test import fetch_and_parse_regulations
from weather_runway import get_metar_avwx
# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")

# Load environment variables from .env.local
load_dotenv(env_path)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})

# Initialize Firebase (in production, use environment variables)
try:
    cred = credentials.Certificate("serviceAccount.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Firebase initialization error: {e}")
    print("Using mock data instead")
    db = None

# Initialize Gemini AI
api_key = os.environ.get("GEMINI_API_KEY", "your-api-key")
if api_key != "your-api-key":
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-pro-exp')
    model2 = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21')
else:
    model = None
    print("Warning: GEMINI_API_KEY not set. AI features will be limited.")

# Initialize FAISS and SentenceTransformer
try:
    encoder = SentenceTransformer('all-MiniLM-L6-v2')
    vector_dimension = 384  # Dimension of the embeddings from the model
    index = faiss.IndexFlatL2(vector_dimension)
except Exception as e:
    print(f"FAISS initialization error: {e}")
    print("Vector search will be limited")
    encoder = None
    index = None

# Aircraft data with Gulfstream 550 prioritized
aircraft_data = [
    {
        "id": "g550",
        "type": "Gulfstream",
        "model": "550",
        "icao": "GLF5",
        "description": "Large cabin, ultra-long-range business jet",
        "ceiling": 51000,
        "range": 6750,
        "max_passengers": 19,
        "special_requirements": [
            "High-altitude operations require supplemental oxygen system checks",
            "Extended overwater operations require additional emergency equipment",
            "RVSM airspace compliance required for optimal routing"
        ],
        "common_compliance_issues": [
            "Oxygen system inspection requirements",
            "MEL requirements for international operations",
            "Flight crew rest requirements for ultra-long-range flights"
        ]
    },
    {
        "id": "g650",
        "type": "Gulfstream",
        "model": "650",
        "icao": "GLF6",
        "description": "Ultra-long-range business jet",
        "ceiling": 51000,
        "range": 7000,
        "max_passengers": 19
    },
    {
        "id": "c172",
        "type": "Cessna",
        "model": "172",
        "icao": "C172",
        "description": "Single-engine light aircraft",
        "ceiling": 14000,
        "range": 800,
        "max_passengers": 3
    },
    {
        "id": "pc12",
        "type": "Pilatus",
        "model": "PC-12",
        "icao": "PC12",
        "description": "Single-engine turboprop",
        "ceiling": 30000,
        "range": 1700,
        "max_passengers": 9
    }
]

# Load FAA regulations data
def load_faa_regulations():
    # In a real implementation, this would load from a database or API
    # For demo purposes, we'll use a small sample with focus on Gulfstream 550
    # regulations = [
    #     {
    #         "id": "AC 135-12B",
    #         "title": "Oxygen Mask Inspection",
    #         "content": "New inspection requirements for oxygen masks on high-altitude flights. Masks must be inspected every 90 days.",
    #         "category": "advisory_circular",
    #         "date": "2025-03-10"
    #     },

    #     {
    #         "id": "AC GLF5-2025-01",
    #         "title": "Gulfstream 550 RVSM Operations",
    #         "content": "Updated requirements for Gulfstream 550 aircraft operating in RVSM airspace. New altimeter testing procedures required.",
    #         "category": "advisory_circular",
    #         "date": "2025-02-15",
          
    #     },
    #     {
    #         "id": "LOI 2025-G550-01",
    #         "title": "Gulfstream 550 MEL Requirements",
    #         "content": "Legal interpretation clarifying MEL requirements specific to Gulfstream 550 aircraft on international operations.",
    #         "category": "legal_interpretation",
    #         "date": "2025-01-20",
           
    #     }
    # ]
    regulations = []
    url = 'https://www.ecfr.gov/api/renderer/v1/content/enhanced/2025-03-12/title-14?chapter=I&subchapter=G&part=135'
    regulations += fetch_and_parse_regulations(url)
    print(regulations)
    # Store in Firebase if available
    if db:
        for reg in regulations:
            db.collection('regulations').document(reg['id']).set(reg)
    
    # Create FAISS index if available
    if encoder and index:
        texts = [f"{r['id']} {r['title']} {r['content']}" for r in regulations]
        embeddings = encoder.encode(texts)
        
        if index.ntotal > 0:
            index.reset()
        index.add(np.array(embeddings).astype('float32'))
    
    return regulations

# Initialize regulations
regulations = load_faa_regulations()

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Flinsight API is running"})

@app.route('/api/aircraft', methods=['GET'])
def get_aircraft():
    return jsonify(aircraft_data)

import typing_extensions as typing
class responseSchema(typing.TypedDict):
   
    applicable_regulations: list[str]
    required_actions: list[str]
    compliance_risks: list[str]

def get_from_metar(metar_data):
    observation_time = metar_data.get("time", {}).get("dt", "N/A")
    temperature = metar_data.get("temperature", {}).get("value", "N/A")
    wind_speed = metar_data.get("wind_speed", {}).get("value", "N/A")
    wind_dir = metar_data.get("wind_direction", {}).get("value", "N/A")
    visibility = metar_data.get("visibility", {}).get("value", "N/A")
    return f"observation time: {observation_time}, temperature: {temperature} C, wind speed: {wind_speed} knots, wind direction: {wind_dir}, visibility: {visibility}"

@app.route('/api/weather_at', methods=['POST'])
def weather_at():
    data = request.json
    departure = data.get('departure', '')
    arrival = data.get('arrival', '')
    metar_data1 = get_from_metar(get_metar_avwx(departure)) 
    metar_data2 = get_from_metar(get_metar_avwx(arrival)) 
    return jsonify({"departure": metar_data1, "arrival": metar_data2})

@app.route('/api/analyze-flight', methods=['POST'])
def analyze_flight():
    data = request.json
  
    # Extract flight details
    departure = data.get('departure', '')
    arrival = data.get('arrival', '')
    aircraft = data.get('aircraft', '')
    date = data.get('date', '')
    passengers = data.get('passengers', 0)
    
    # Create flight context for AI
    flight_context2 = f"""
    Flight Details:
    - Departure: {departure}
    - Arrival: {arrival}
    - Aircraft: {aircraft}
    - Date: {date}
    - Passengers: {passengers}
    """

    metar_data1 = f"information at {departure}: ```" + get_from_metar(get_metar_avwx(departure)) + "```"
    metar_data2 = f"information at {arrival}: ```" + get_from_metar(get_metar_avwx(arrival)) + "```"
    flight_context = model2.generate_content(f"Given the flight context, come up with an exhaustive list of concise compliance risks considering the route, aircraft, passengers, temperatures, whether the flight is an international one (important), overwater, and every relation between them. Flight context: {flight_context2}\n{metar_data1}\n{metar_data2}").text
            
    # Find if this is a Gulfstream 550 flight
    is_g550 = "gulfstream" in aircraft.lower() and "550" in aircraft
    
    # Query FAISS for relevant regulations if available
    if encoder and index:
        query_embedding = encoder.encode([flight_context])
        distances, indices = index.search(np.array(query_embedding).astype('float32'), 5)
        
        relevant_regs = [regulations[idx] for idx in indices[0]]
        print(relevant_regs)
    else:
        # Without FAISS, filter manually with prioritization for G550
        if is_g550:
            relevant_regs = [r for r in regulations if 'aircraft_types' in r and 'GLF5' in r['aircraft_types']]
            # Add some general regulations if we don't have enough G550-specific ones
            if len(relevant_regs) < 3:
                general_regs = [r for r in regulations if 'aircraft_types' not in r]
                relevant_regs.extend(general_regs[:3-len(relevant_regs)])
        else:
            relevant_regs = [r for r in regulations if 'aircraft_types' not in r][:3]
    
    # Use Gemini to generate contextual insights
    if model:
        prompt = f"""
        As an aviation compliance AI assistant, analyze this flight plan:
        
        {flight_context2}
        
        Based on these potentially relevant regulations:
        {json.dumps(relevant_regs, indent=2)}
        
        Provide:
        1. applicable_regulations: Which regulations specifically apply to this flight
        2. compliance_risks: What actions the operator needs to take for compliance
        3. required_actions: Any potential compliance risks

        all 3 lists should be the same size, with the same index for all 3 lists corresponding to the same regulation analysis.

        Ensure your response is concise and contains all the necessary information.
       
        """
        
        try:
            response = model.generate_content(prompt, generation_config=genai.GenerationConfig(response_mime_type="application/json",
                                                response_schema = responseSchema))
            print(response.text)
            ai_analysis = json.loads(response.text)
        except Exception as e:
            print(f"Error with Gemini API: {e}")
            # Fallback response if AI fails
            ai_analysis = {
                "applicable_regulations": [r["id"] + ": " + r["title"] for r in relevant_regs],
                "required_actions": ["Verify compliance with " + r["title"] for r in relevant_regs],
                "compliance_risks": ["Potential non-compliance with " + r["title"] for r in relevant_regs]
            }
    else:
        # Without Gemini, provide mock analysis
        if is_g550:
            ai_analysis = {
                "applicable_regulations": [
                    "AC GLF5-2025-01: Gulfstream 550 RVSM Operations",
                    "LOI 2025-G550-01: Gulfstream 550 MEL Requirements",
                    "AC 135-12B: Oxygen Mask Inspection"
                ],
                "required_actions": [
                    "Verify altimeter testing is current for RVSM operations",
                    "Ensure MEL compliance for international operations",
                    "Confirm oxygen masks have been inspected within the last 90 days"
                ],
                "compliance_risks": [
                    "Non-compliance with RVSM requirements could result in routing restrictions",
                    "Outdated MEL items may cause operational delays",
                    "Oxygen system deficiencies may restrict high-altitude operations"
                ]
            }
        else:
            ai_analysis = {
                "applicable_regulations": [r["id"] + ": " + r["title"] for r in relevant_regs],
                "required_actions": ["Verify compliance with " + r["title"] for r in relevant_regs],
                "compliance_risks": ["Potential non-compliance with " + r["title"] for r in relevant_regs]
            }
    
    # Store analysis in Firebase
    flight_record = {
        "departure": departure,
        "arrival": arrival,
        "aircraft": aircraft,
        "date": date,
        "passengers": passengers,
        "analysis": ai_analysis,
        "timestamp": firestore.SERVER_TIMESTAMP if db else datetime.now().isoformat()
    }
    
    if db:
        db.collection('flight_analyses').add(flight_record)
    
    return jsonify({
        "flight_details": {
            "departure": departure,
            "arrival": arrival,
            "aircraft": aircraft,
            "date": date,
            "passengers": passengers
        },
        "analysis": ai_analysis
    })

@app.route('/api/regulations', methods=['GET'])
def get_regulations():
    # Get query parameters
    category = request.args.get('category', None)
    search = request.args.get('search', None)
    aircraft_type = request.args.get('aircraft_type', None)
    
    if db:
        # Query Firestore
        query = db.collection('regulations')
        
        if category:
            query = query.where('category', '==', category)
        
        results = query.get()
        regulations_list = [doc.to_dict() for doc in results]
    else:
        # Without Firebase, use our local data
        regulations_list = regulations
        if category:
            regulations_list = [r for r in regulations_list if r['category'] == category]
    
    # Filter by aircraft type (prioritize Gulfstream 550)
    if aircraft_type:
        # First include exact matches
        exact_matches = [r for r in regulations_list if 'aircraft_types' in r and aircraft_type in r['aircraft_types']]
        # Then include regulations with no specific aircraft type (general regulations)
        general_regs = [r for r in regulations_list if 'aircraft_types' not in r]
        regulations_list = exact_matches + general_regs
    elif 'GLF5' not in request.args.get('exclude_prioritization', ''):
        # If no specific filter but we're not explicitly asked to exclude prioritization,
        # still prioritize G550 regulations
        g550_regs = [r for r in regulations_list if 'aircraft_types' in r and 'GLF5' in r['aircraft_types']]
        other_regs = [r for r in regulations_list if 'aircraft_types' not in r or 'GLF5' not in r['aircraft_types']]
        regulations_list = g550_regs + other_regs
    
    # If search term provided, filter results
    if search and search.strip():
        search_lower = search.lower()
        regulations_list = [
            r for r in regulations_list 
            if search_lower in r['title'].lower() or search_lower in r['content'].lower()
        ]
    
    return jsonify(regulations_list)

@app.route('/api/fetch-faa-updates', methods=['GET'])
def fetch_faa_updates():
        """Fetch latest FAA updates from RSS feeds and APIs"""
    # try:
        # Mock data with emphasis on Gulfstream 550
        updates = []
        today = datetime.today()
        thirty_days_ago = today - timedelta(days=120)

        # Reference to the regulations collection
        regulations_ref = db.collection('regulations')

        # Query the collection for regulations with a date within the last 30 days
        query = regulations_ref.stream()

        # List to hold the regulations that match the filter
        recent_regulations = []

        for regulation in query:
            regulation_data = regulation.to_dict()
            print(regulation_data['date'])
            # Handle regulations with an unknown date
            if (regulation_data['date']== None) or regulation_data['date'].lower() == "unknown":
                regulation_data['date'] = "1900-01-01"  # Treat "Unknown" dates as the earliest possible date
            try:
                # Parse the date
                regulation_date = datetime.strptime(regulation_data['date'], '%Y-%m-%d')
                
                # Only add regulations within the last 30 days or with an unknown date
                if regulation_date >= thirty_days_ago:
                    regulation_data['id'] = regulation.id
                    recent_regulations.append(regulation_data)
            except ValueError as e:
                print(e)
                # Skip regulations with invalid date values (not "unknown")
                pass

    # Sort regulations by date (most recent first), with "unknown" at the end
        recent_regulations.sort(key=lambda x: (x['date'], x['date'] != "1900-01-01"), reverse=True)

        updates = recent_regulations
       
    # Return the number of new regulations and the sorted list
 
        # Store updates in Firebase
        def is_update_processed(update_id, db):
            try:
                doc_ref = db.collection('faa_updates').document(update_id)
            except:
                return False
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict().get('processed', False)
            return False 
        if db:
            for update in updates:
                # Check if the update already exists in the database and if it was processed
                if not is_update_processed(update['id'], db):
                    # If not processed, add timestamp and mark it as unprocessed
                    update['timestamp'] = firestore.SERVER_TIMESTAMP
                    update['processed'] = False
                    db.collection('faa_updates').document(update["id"]).set(update)

# Process updates with Gemini AI
        if model:
            for update in updates:
                # Check if the update has already been processed in Firestore
                if not is_update_processed(update['id'], db):
                    # If not processed, run the AI processing
                    try:
                        process_update_with_ai(update)
                        
                        # After processing, mark the update as processed
                        update['processed'] = True
                    except Exception as e:
                        print(e)
                        pass
                    # Update the processed status in Firestore
                else:
                    update['ai_analysis'] = db.collection('faa_updates').document(update["id"]).get().to_dict().get('ai_analysis')
                    
                
        # Prioritize Gulfstream 550 updates
        g550_updates = [u for u in updates if 'aircraft_types' in u and 'GLF5' in u['aircraft_types']]
        other_updates = [u for u in updates if 'aircraft_types' not in u or 'GLF5' not in u['aircraft_types']]
        prioritized_updates = g550_updates + other_updates
        
        return jsonify({"status": "success", "updates": prioritized_updates})
    
    # except Exception as e:
    #     print(e)
    #     return jsonify({"status": "error", "message": str(e)})

 
class processUpdateChild(typing.TypedDict):
    potential_implications: str
    real_applicability: str 


def process_update_with_ai(update):
    """Process FAA updates with Gemini AI to extract key information"""
    if not model:
        # Skip if no AI model is available
        return
        
    prompt = f"""
    Analyze this FAA update:
    
    Title: {update['title']}
    Description: {update['content']}
    Date: {update['date']}
    
   Only answer, concisely: Who this applies to (aircraft types, operators, etc.)

    
    """
    
    try:
        response = model2.generate_content(prompt)
        print(response.text)
        ai_analysis = {"applicability": response.text}
       
        # Update the record in Firebase
        if db:
            update_query = db.collection('faa_updates').where('title', '==', update['title']).limit(1)
            docs = update_query.get()
            
            for doc in docs:
                doc.reference.update({
                    "ai_analysis": ai_analysis,
                    "processed": True
                })
                update["ai_analysis"] = ai_analysis
    
    except Exception as e:
        print(f"Error processing update with AI: {e}")

@app.route('/api/generate-action-items', methods=['POST'])
def generate_action_items():
    """Generate action items based on flight analysis"""
    data = request.json
    flight_id = data.get('flight_id')
    
    if not flight_id:
        return jsonify({"status": "error", "message": "Flight ID is required"})
    
    # Get flight analysis from Firebase or use mock data
    flight_data = None
    
    if db:
        flight_docs = db.collection('flight_analyses').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(1).stream()
        print(flight_docs)
        # Get the first document
        flight_doc = next(flight_docs, None)
        if flight_doc.exists:
            flight_data = flight_doc.to_dict()
            print(flight_data)
        del flight_data["analysis"]["required_actions"] 


    if not flight_data:
        # Mock data focusing on Gulfstream 550
        flight_data = {
            "departure": "KJFK",
            "arrival": "EGLL",
            "aircraft": "Gulfstream 550",
            "date": "2025-04-15",
            "passengers": 12,
            "analysis": {
                "applicable_regulations": [
                    "AC GLF5-2025-01: Gulfstream 550 RVSM Operations",
                    "LOI 2025-G550-01: Gulfstream 550 MEL Requirements",
                    "AC 135-12B: Oxygen Mask Inspection"
                ],
                "compliance_risks": [
                    "Non-compliance with RVSM requirements could result in routing restrictions",
                    "Outdated MEL items may cause operational delays",
                    "Oxygen system deficiencies may restrict high-altitude operations"
                ]
            }
        }
    
    # Use Gemini to generate action items
    action_items = []

    class actionItems(typing.TypedDict):
        title: str
        description: str
        due_date: str
        responsible_role: str
    if model:
        prompt = f"""
        Based on this flight analysis, generate a short list of specific action items that the operator needs to complete for compliance:
        ```{str(flight_data)}```
        
       
        
        Return a list of action items, each with the following 4 keys
        1. title (short, specific task)
        2. description (detailed explanation)
        3. due_date (relative to flight date)
        4. responsible_role (pilot, maintenance, dispatch, etc.)
        
        Ensure your response is concise and contains all the necessary information in the proper structured output.
        """
        
        try:
            response = model.generate_content(prompt, generation_config=genai.GenerationConfig(response_mime_type="application/json",
                                                response_schema = list[actionItems]))
            print(response)
            action_items = json.loads(response.text)

        except Exception as e:
            print(f"Error generating action items with AI: {e}")
    
    # If AI failed or no model, use mock data
    if not action_items:
        is_g550 = "gulfstream" in flight_data["aircraft"].lower() and "550" in flight_data["aircraft"]
        
        if is_g550:
            action_items = [
                {
                    "title": "Verify RVSM certification",
                    "description": "Check that the aircraft's RVSM certification is current and the altimeter has been tested within the required timeframe.",
                    "due_date": "3 days before departure",
                    "responsible_role": "Maintenance"
                },
                {
                    "title": "Review G550 MEL items",
                    "description": "Conduct a thorough review of the MEL to ensure compliance with international operations requirements specific to the Gulfstream 550.",
                    "due_date": "5 days before departure",
                    "responsible_role": "Pilot/Dispatch"
                },
                {
                    "title": "Inspect oxygen system",
                    "description": "Perform the 90-day inspection of the oxygen distribution system as required by recent AD.",
                    "due_date": "7 days before departure",
                    "responsible_role": "Maintenance"
                },
                {
                    "title": "Confirm overwater equipment",
                    "description": "Verify all required overwater safety equipment is onboard and within inspection dates.",
                    "due_date": "1 day before departure",
                    "responsible_role": "Pilot"
                }
            ]
        else:
            action_items = [
                {
                    "title": "Review applicable regulations",
                    "description": "Review all regulations applicable to this flight.",
                    "due_date": "3 days before departure",
                    "responsible_role": "Pilot"
                },
                {
                    "title": "Check MEL items",
                    "description": "Verify all MEL items are addressed before departure.",
                    "due_date": "1 day before departure",
                    "responsible_role": "Maintenance"
                }
            ]
    
    # Store action items in Firebase
    if db:
        for item in action_items:
            try:
                item_data = {
                    "flight_id": flight_id,
                    "title": item["title"],
                    "description": item["description"],
                    "due_date": item["due_date"],
                    "responsible_role": item["responsible_role"],
                    "status": "pending",
                    "created_at": firestore.SERVER_TIMESTAMP
                }
                
                db.collection('action_items').add(item_data)
            except Exception as e:
                print (item,e)
                action_items.remove(item)
    
    return jsonify({"status": "success", "action_items": action_items})

def get_relevant_regulations(query: str, n_results: int = 5):
    """Search for relevant regulations using vector similarity."""
     # Query FAISS for relevant regulations if available
    if encoder and index:
        query_embedding = encoder.encode([query])
        distances, indices = index.search(np.array(query_embedding).astype('float32'), n_results)
        relevant_regs = [regulations[idx] for idx in indices[0]]
    
        return relevant_regs
    else:
        return []

def format_regulations_for_context(regulations) -> str:
    """Format regulations into a string for the prompt."""
    context = "Relevant FAA Part 135 regulations:\n\n"
    for reg in regulations:
        context += f"Section {reg['id']}, {reg['title']}:\n"
        context += f"{reg['content']}\n\n"
    return context

CHAT_SYSTEM_PROMPT = """You are an expert FAA regulations assistant specializing in Part 135 operations. 
Your role is to help users understand and comply with FAA regulations.

When responding:
1. Always base your answers on the provided regulation context
2. Quote specific sections when relevant
3. Explain regulations in clear, simple terms
4. If you're unsure about something, say so
5. Focus on practical compliance advice
6. Mention any related regulations that might be relevant

Context format will be:
{context}

Remember to:
- Be precise and accurate
- Cite specific regulation sections
- Explain the practical implications
- Suggest compliance strategies
"""

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message")
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Get relevant regulations using RAG
        relevant_regulations = get_relevant_regulations(user_message)
        context = format_regulations_for_context(relevant_regulations)
        
        # Prepare the chat prompt
        prompt = CHAT_SYSTEM_PROMPT.format(context=context)
        
        # Generate response using Gemini
        chat = model2.start_chat(history=[])
        response = chat.send_message(
            f"System: {prompt}\n\nUser: {user_message}",
        )

        return jsonify({
            "response": response.text,
            "regulations_used": [relevant_regulations]
        })

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "error": "Failed to process chat message",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

