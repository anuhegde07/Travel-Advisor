from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging
import html
import re
import time

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

WIKIVOYAGE_API = "https://en.wikivoyage.org/w/api.php"
OVERPASS_API = "https://overpass-api.de/api/interpreter"
NOMINATIM_API = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "TravelPlannerApp/1.0 (contact: your-email@example.com)"}

def clean_snippet(snippet: str) -> str:
    if not snippet:
        return "No description"
    text = html.unescape(snippet)
    text = re.sub(r"<.*?>", "", text)
    return text

def geocode_destination(destination):
    """Get lat/lon for a city using Nominatim API."""
    params = {
        "q": destination,
        "format": "json",
        "limit": 1
    }
    try:
        r = requests.get(NOMINATIM_API, params=params, headers=HEADERS, timeout=10)
        r.raise_for_status()
        results = r.json()
        if results:
            return float(results[0]["lat"]), float(results[0]["lon"])
        raise ValueError(f"No coordinates found for {destination}")
    except Exception as e:
        logging.error(f"Nominatim geocoding failed for {destination}: {e}")
        raise
    finally:
        time.sleep(1)  # Respect Nominatim's 1-second delay policy

def get_accommodations(destination, acc_type="Hotel"):
    """Fetch accommodations from Overpass API (OpenStreetMap)."""
    # Map frontend accommodation types to OSM tourism tags
    type_map = {
        "hotel": "hotel",
        "guesthouse": "guest_house",
        "resort": "resort",
        "bed & breakfast": "guest_house",  
        "villa": "chalet",  
        "motel": "motel",
        "homestay": "guest_house"
    }
    osm_type = type_map.get(acc_type.lower().replace(" ", "_").replace("&", ""), "hotel")

    try:
        # Step 1: Geocode destination to get center coordinates
        lat, lon = geocode_destination(destination)

        # Step 2: Build Overpass QL query
        query = f"""
        [out:json][timeout:25];
        (
          node["tourism"="{osm_type}"](around:10000,{lat},{lon});
          way["tourism"="{osm_type}"](around:10000,{lat},{lon});
        );
        out body;
        """
        data = {"data": query}
        
        # Step 3: Query Overpass API
        r = requests.post(OVERPASS_API, data=data, headers=HEADERS, timeout=25)
        r.raise_for_status()
        results = r.json().get("elements", [])

        if not results:
            return [{"name": destination, "type": acc_type, "lat": None, "lon": None, "reason": f"No {acc_type.lower()}s found near {destination}."}]

        accommodations = []
        for item in results[:5]:  # Limit to 5 for performance
            tags = item.get("tags", {})
            name = tags.get("name", "Unnamed " + acc_type)
            address = tags.get("addr:full", tags.get("addr:street", "Address unavailable"))
            lat = item.get("lat", None)  # Nodes have lat/lon directly
            lon = item.get("lon", None)
            if not lat and "center" in item:  # Ways have center
                lat = item["center"]["lat"]
                lon = item["center"]["lon"]
            accommodations.append({
                "name": name,
                "type": acc_type,  # Use requested type for display
                "description": address,  # Use address as description
                "lat": lat,
                "lon": lon
            })

        return accommodations

    except Exception as e:
        logging.exception(f"Failed to fetch accommodations for {destination}: {e}")
        return [{"name": destination, "type": acc_type, "lat": None, "lon": None, "reason": f"Failed to fetch {acc_type.lower()}s: {str(e)}"}]

def get_places(destination, limit=10):
    params = {
        "action": "query",
        "list": "search",
        "srsearch": f"{destination} attractions OR landmarks OR sightseeing",
        "srlimit": limit,
        "format": "json"
    }
    try:
        r = requests.get(WIKIVOYAGE_API, params=params, headers=HEADERS, timeout=10)
        r.raise_for_status()
        hits = r.json().get("query", {}).get("search", [])
    except Exception as e:
        return [{"name": "Error", "description": f"Failed to fetch places: {str(e)}", "lat": None, "lon": None}]

    if not hits:
        return [{"name": destination, "description": f"Sorry, no attractions found for {destination}.", "lat": None, "lon": None}]

    places = []
    for h in hits:
        title = h["title"]
        # Geocode the place using Nominatim
        try:
            params = {
                "q": f"{title}, {destination}",
                "format": "json",
                "limit": 1
            }
            r = requests.get(NOMINATIM_API, params=params, headers=HEADERS, timeout=10)
            r.raise_for_status()
            results = r.json()
            lat = float(results[0]["lat"]) if results else None
            lon = float(results[0]["lon"]) if results else None
            time.sleep(1)  # Respect Nominatim's 1-second delay
        except Exception as e:
            logging.error(f"Nominatim geocoding failed for {title}: {e}")
            lat, lon = None, None

        places.append({
            "name": title,
            "description": clean_snippet(h.get("snippet", "")),
            "lat": lat,
            "lon": lon
        })

    return places
# def get_places(destination, limit=10):
#     params = {
#         "action": "query",
#         "list": "search",
#         "srsearch": f"{destination} attractions OR landmarks OR sightseeing",
#         "srlimit": limit,
#         "format": "json"
#     }
#     try:
#         r = requests.get(WIKIVOYAGE_API, params=params, headers=HEADERS, timeout=10)
#         r.raise_for_status()
#         hits = r.json().get("query", {}).get("search", [])
#     except Exception as e:
#         return [{"name": "Error", "description": f"Failed to fetch places: {str(e)}"}]

#     if hits:
#         return [
#             {"name": h["title"], "description": clean_snippet(h.get("snippet", ""))}
#             for h in hits
#         ]
#     return [{"name": destination, "description": f"Sorry, no attractions found for {destination}."}]

def build_itinerary(places, days):
    itinerary = []
    # Cycle through places based on number of days
    for day in range(1, days + 1):
        place = places[(day - 1) % len(places)]
        itinerary.append({
            "day": day,
            "activity": f"Visit {place['name']}",
            "details": place.get("description", "")
        })
    return itinerary

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json(force=True)
        destination = data.get("destination")
        accommodation = data.get("accommodation", "Hotel")
        travelMode = data.get("travelMode", "Train")

        if not destination:
            return jsonify({"error": "Please provide a destination"}), 400

        places = get_places(destination, limit=10)
        accommodations = get_accommodations(destination, accommodation)

        result = {
            "places": places,
            "accommodation": accommodations,
            "transport": f"Preferred travel mode: {travelMode}"
        }
        return jsonify(result)
    except Exception as e:
        logging.exception("/recommend failed")
        return jsonify({"error": str(e)}), 500

@app.route("/itinerary", methods=["POST"])
def itinerary():
    try:
        data = request.get_json(force=True)
        destination = data.get("destination")
        days = int(data.get("days", 3))  # default 3 days
        if not destination:
            return jsonify({"error": "Please provide a destination"}), 400

        places = get_places(destination, limit=10)
        plan = build_itinerary(places, days)

        return jsonify({"itinerary": plan})
    except Exception as e:
        logging.exception("/itinerary failed")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
