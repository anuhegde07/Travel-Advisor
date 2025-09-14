# Travel Advisor App

A full-stack travel planning app built with React (frontend) and Flask (backend). Features include destination recommendations, accommodation suggestions via OpenStreetMap's Overpass API, and itinerary planning using Wikivoyage data.

## Features
- Search for places, accommodations, and travel modes.
- Trending destinations on load.
- Interactive itinerary planner with accordion view.
- OpenStreetMap integration for free location viewing.
- Responsive design with purple-themed UI.

## Tech Stack
- **Frontend**: React, Axios, CSS
- **Backend**: Flask, Requests (for Wikivoyage, Overpass API, Nominatim)
- **APIs**: OpenStreetMap (Overpass, Nominatim), Wikivoyage (free)

## Setup
### Backend
1. Navigate to `backend/`: `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Run: `python app.py`
   - Server runs on `http://localhost:5000`

### Frontend
1. Navigate to `frontend/`: `cd frontend`
2. Install dependencies: `npm install`
3. Run: `npm start`
   - App runs on `http://localhost:3000`

## Usage
1. Load the app to see trending destinations.
2. Search for a destination (e.g., "Paris") and select accommodation/travel options.
3. View places, accommodations, or generate an itinerary.

## Notes
- Uses free APIs only (no Google Places).
- For production, add caching for API calls to respect rate limits.

## License
MIT