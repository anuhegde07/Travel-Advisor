import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

export const SearchBar = () => {
  const [destination, setDestination] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [travelMode, setTravelMode] = useState("");
  const [days, setDays] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [activeTab, setActiveTab] = useState("places");
  const [error, setError] = useState("");
  const [trendingPlaces, setTrendingPlaces] = useState([]);

  // Fetch trending places on component mount
  useEffect(() => {
    fetchTrendingPlaces();
  }, []);

  const fetchTrendingPlaces = async () => {
    try {
      // Hardcoded trending places for simplicity
      const trending = [
        {
          name: "Paris, France",
          description: "Romantic city with the Eiffel Tower and charming cafes.",
          lat: 48.8566,
          lon: 2.3522,
        },
        {
          name: "New York, USA",
          description: "Vibrant metropolis with Times Square and Central Park.",
          lat: 40.7128,
          lon: -74.0060,
        },
        {
          name: "Tokyo, Japan",
          description: "Blend of modern skyscrapers and historic temples.",
          lat: 35.6762,
          lon: 139.6503,
        },
        {
          name: "London, UK",
          description: "Historic city with Big Ben and Buckingham Palace.",
          lat: 51.5074,
          lon: -0.1278,
        },
        {
          name: "Sydney, Australia",
          description: "Iconic Opera House and stunning Sydney Harbour.",
          lat: -33.8688,
          lon: 151.2093,
        },
      ];
      setTrendingPlaces(trending);
    } catch (err) {
      console.error("Error fetching trending places:", err);
    }
  };

  // const handleExplore = async (placeName) => {
  //   setDestination(placeName);
  //   setError("");
  //   try {
  //     const response = await axios.post("http://localhost:5000/recommend", {
  //       destination: placeName,
  //       accommodation,
  //       travelMode,
  //     });
  //     setRecommendation(response.data);
  //     setItinerary(null);
  //     setActiveTab("places");
  //   } catch (err) {
  //     console.error("Error fetching recommendations for:", placeName, err);
  //     setError("Could not fetch recommendations. Please try again.");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/recommend", {
        destination,
        accommodation,
        travelMode,
      });
      setRecommendation(response.data);
      setItinerary(null);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Could not fetch recommendations. Please try again.");
    }
  };

  const handleItinerary = async () => {
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/itinerary", {
        destination,
        days,
      });
      setItinerary(response.data.itinerary);
      setActiveTab("itinerary");
    } catch (err) {
      console.error("Error fetching itinerary:", err);
      setError("Could not generate itinerary. Please try again.");
    }
  };

  return (
    <div className="App">
      {/* Trending Places Section */}
      
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="searchBar">
        <label>Destination</label>
        <div className="search-1">
          <input
            type="text"
            placeholder="Enter Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <label>Accommodation Type</label>
        <div className="search-1">
          <select
            value={accommodation}
            onChange={(e) => setAccommodation(e.target.value)}
          >
            <option value="">Select type</option>
            <option>Hotel</option>
            <option>Hostel</option>
            <option>Guesthouse</option>
            <option>Resort</option>
            <option>Bed & Breakfast</option>
            <option>Villa</option>
            <option>Motel</option>
            <option>Homestay</option>
          </select>
        </div>

        <label>Travel Mode</label>
        <div className="search-1">
          <select
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value)}
          >
            <option value="">Select mode</option>
            <option>Flight</option>
            <option>Train</option>
            <option>Bus</option>
            <option>Car / Taxi</option>
            <option>Bike / Scooter</option>
            <option>Metro / Subway</option>
            <option>Walk</option>
          </select>
        </div>

        <button type="submit">Get Recommendations</button>
      </form>
<div className="trending-section">
        <h2>Trending Destinations</h2>
        {trendingPlaces.length > 0 ? (
          <div className="trending-grid">
            {trendingPlaces.map((place, i) => (
              <div className="trending-card" key={i}>
                <h3>{place.name}</h3>
                <p>{place.description}</p>
                {place.lat && place.lon ? (
                  <p>
                    📍{" "}
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=15/${place.lat}/${place.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Map ({place.lat.toFixed(3)}, {place.lon.toFixed(3)})
                    </a>
                  </p>
                ) : (
                  <p>📍 Location unavailable</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No trending destinations available.</p>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <br />
      {recommendation && (
        <div className="recommendation-box">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={activeTab === "places" ? "active" : ""}
              onClick={() => setActiveTab("places")}
            >
              Places
            </button>
            <button
              className={activeTab === "accommodation" ? "active" : ""}
              onClick={() => setActiveTab("accommodation")}
            >
              Accommodation
            </button>
            <button
              className={activeTab === "itinerary" ? "active" : ""}
              onClick={() => setActiveTab("itinerary")}
            >
              Itinerary
            </button>
          </div>

          {/* Places */}
          {activeTab === "places" && (
            <div className="places">
              <h2>Places to Visit</h2>
              {recommendation.places?.length > 0 ? (
                <ul>
                  {recommendation.places.map((r, i) => (
                    <li key={i}>
                      <h3>{r.name}</h3>
                      <p>{r.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No places found for this destination.</p>
              )}
            </div>
          )}

          {/* Accommodation */}
          {activeTab === "accommodation" && (
            <div className="accommodation">
              <h2>Accommodation Options</h2>
              {recommendation.accommodation?.length > 0 ? (
                <div className="accommodation-grid">
                  {recommendation.accommodation.map((r, i) => (
                    <div className="accommodation-card" key={i}>
                      <h3>
                        {r.name}{" "}
                        <span className="accommodation-type">{r.type}</span>
                      </h3>
                      {r.reason ? (
                        <p className="error">{r.reason}</p>
                      ) : (
                        <>
                          <p>{r.description || "No description available"}</p>
                          {r.lat && r.lon ? (
                            <p>
                              📍{" "}
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lon}#map=15/${r.lat}/${r.lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View on Map ({r.lat.toFixed(3)}, {r.lon.toFixed(3)})
                              </a>
                            </p>
                          ) : (
                            <p>📍 Location unavailable</p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>
                  No {accommodation || "accommodation"} options found. Try another destination or type.
                </p>
              )}
            </div>
          )}

          {/* Itinerary */}
          {activeTab === "itinerary" && (
            <div className="itinerary">
              <h2>Itinerary Planner</h2>
              <div className="planner">
                <input
                  type="number"
                  placeholder="Enter number of days"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
                <button onClick={handleItinerary}>Generate Itinerary</button>
              </div>

              {itinerary && (
                <div className="itinerary-accordion">
                  {itinerary.map((day, i) => (
                    <div className="itinerary-card" key={i}>
                      <input
                        type="checkbox"
                        id={`day-${day.day}`}
                        className="itinerary-toggle"
                      />
                      <label
                        htmlFor={`day-${day.day}`}
                        className="itinerary-header"
                      >
                        <h3>Day {day.day}: {day.activity}</h3>
                        <span className="toggle-icon"></span>
                      </label>
                      <div className="itinerary-content">
                        <p>{day.details || "No details available"}</p>
                        {day.lat && day.lon ? (
                          <p>
                            📍{" "}
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${day.lat}&mlon=${day.lon}#map=15/${day.lat}/${day.lon}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View on Map ({day.lat.toFixed(3)}, {day.lon.toFixed(3)})
                            </a>
                          </p>
                        ) : (
                          <p>📍 Location unavailable</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};