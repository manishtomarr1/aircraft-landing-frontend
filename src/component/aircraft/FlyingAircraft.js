import React, { useState, useEffect } from "react";
import axios from "axios";
import { REACT_APP_API_BASE_URL } from "../../config";
import airplane from "../../asset/airplane.png";
const FlyingAircraft = () => {
  const [selectedAirport, setSelectedAirport] = useState("");
  const [isAirportBusy, setIsAirportBusy] = useState(false);
  const [airports, setAirports] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingAirports, setLoadingAirports] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Please wait, server is loading...");

  // Fetch all the airports
  useEffect(() => {
    setLoadingAirports(true);
    const fetchAirports = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_BASE_URL}/airports`);
        setAirports(response.data);
        setLoadingAirports(false);
      } catch (error) {
        console.error("Error fetching airports:", error.message);
        setLoadingAirports(false);
      }
    };

    fetchAirports();

    const messageTimeout = setTimeout(() => {
      if (loadingAirports) {
        setLoadingMessage("Server loading is taking longer than expected, please be patient.");
      }
    }, 30000); // Change message after 30 seconds

    return () => clearTimeout(messageTimeout);
  }, []);


  // Polling the status of the selected airport
  //when new airport is select this useeffect is run and take the update on every second from the backend
  useEffect(() => {
    const interval = setInterval(async () => {
      if (selectedAirport) {
        checkAirportStatus(selectedAirport);
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [selectedAirport]);

  // Function to check airport status upon selection -> this function run on every second
  const checkAirportStatus = async (airportID) => {
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/airport-status/${airportID}`
      );
      setIsAirportBusy(response.data.isBusy);

      // Find the selected airport's name
      const airportName =
        airports.find((airport) => airport.airportID === airportID)
          ?.airportName || airportID;

      if (response.data.isBusy) {
        setMessage(
          `${airportName} is busy. Please wait for ${response.data.timeRemaining} seconds.`
        );
      } else {
        setMessage(`${airportName} is free, you can land`);
      }
    } catch (error) {
      console.error("Error checking airport status:", error.message);
      setMessage("");
    }
  };

  const selectAirport = (airportID) => {
    setSelectedAirport(airportID);
    checkAirportStatus(airportID);
  };

  // Function to handle landing click
  const handleLandClick = async () => {
    try {
      const response = await axios.post(
        `${REACT_APP_API_BASE_URL}/land/${selectedAirport}`
      );
      setIsAirportBusy(response.data.isBusy);
      setMessage(response.data.message);
      setSelectedAirport("");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error landing aircraft:", error.message);
      setMessage("Error during landing attempt");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="text-center flex flex-col items-center">
      <div className="w-full flex justify-center">
        <img src={airplane} alt="Flying Aircraft" width="180" height="170" />
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Select Airport to Land:</h2>
        {loadingAirports && (
        <p className="text-blue-500 mt-4 blink-text">
          {loadingMessage}
        </p>
      )}
        <div className="items-center space-y-2">
          {airports.map((airport) => (
            <button
              key={airport.airportID}
              onClick={() => selectAirport(airport.airportID)}
              className={`bg-blue-500 text-white px-4 py-2 mr-5 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ease-in-out duration-300 ${
                selectedAirport === airport.airportID ? "bg-blue-700" : ""
              }`}
            >
              {airport.airportName}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleLandClick}
        className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition ease-in-out duration-300"
        disabled={!selectedAirport || isAirportBusy}
      >
        Land
      </button>

      {message && (
        <p
          className={`${
            isAirportBusy ? "text-red-500" : "text-green-500"
          } mt-4`}
        >
          {message}
        </p>    
      )}
    </div>
  );
};

export default FlyingAircraft;
