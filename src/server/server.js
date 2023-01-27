/** Express router providing user related routes
 * @module server/server
 * @requires express
 * @requires body-parser
 * @requires cors
 * @requires joi
 * @requires dotenv
 */

/**
 * ****************************************************
 * Define dependencies
 */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Joi = require("joi");
const dotenv = require("dotenv");
const crypto = require("crypto");

/**
 * ****************************************************
 * Define data objects
 */

/**
 * tripList holding all the trips with its informations
 * @type {object}
 * @const
 */
const tripList = [];

/**
 * ****************************************************
 * Dotenv configuration
 */
dotenv.config({ path: "config/.env" });

/**
 * ****************************************************
 * Define environment
 */
const port = process.env.PORT || 8080;
const apiCredentials = {
  geoNames: {
    url: "http://api.geonames.org/postalCodeSearchJSON?",
    key: process.env.GEONAMES_API_KEY,
  },
  weatherBit: {
    url: "https://api.weatherbit.io/v2.0/forecast/daily?",
    key: process.env.WEATHERBIT_API_KEY,
  },
  pixaBay: {
    url: "https://pixabay.com/api/?",
    key: process.env.PIXABAY_API_KEY,
  },
};

/**
 * ****************************************************
 * Server configuration
 */

// Start up an instance of app
const app = express();

/* Middleware*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Initialize the main project folder
app.use(express.static("dist"));

// Setup Server
const server = app.listen(port, listening);

function listening() {
  console.log(`Server is up and listening on port: ${port} ...`);
}

/**
 * ****************************************************
 * Route handling
 */

/**
 * Route serving weather data.
 * @name get/weather-records
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.get("/api/pixabay", (request, response) => {
  response.send(apiCredentials.pixaBay);
});

/**
 * Route serving trip data.
 * @name get/trips
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.get("/api/trips", (request, response) => {
  response.send(tripList);
});

/**
 * Route accepting single trip record.
 * @name post/trips
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.post("/api/trips", (request, response) => {
  const { error } = validateTrip(request.body);

  if (error) return response.status(400).send(error.details[0].message);

  createTrip(request.body).then((trip) => {
    tripList.push(trip);
    tripList.sort(
      (a, b) =>
        new Date(a.locations[0].startDate).getTime() -
        new Date(b.locations[0].startDate).getTime()
    );

    response.send(trip);
  });
});

async function createTrip(requestData) {
  const trip = handleRequest(requestData);

  for (let i = 0; i < trip.locations.length; i++) {
    const coords = await getLocationCoords(trip.locations[i].name);

    if (!coords) continue;

    trip.locations[i].lat = coords.lat;
    trip.locations[i].lng = coords.lng;

    const weatherForecast = await getWeatherForecast(
      trip.locations[i].lat,
      trip.locations[i].lng
    );

    trip.locations[i].weatherForecast = weatherForecast;
  }

  return trip;
}

function handleRequest(requestData) {
  const trip = {
    id: crypto.randomBytes(16).toString("hex"),
    packagingList: requestData.packagingList,
    locations: requestData.locations,
  };

  // always store first location in beginning of array
  trip.locations.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return trip;
}

/**
 * Route deleting single trip record.
 * @name delete/trips
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.delete("/api/trips/:id", (request, response) => {
  const trip = tripList.find((elem) => elem.id === request.params.id);

  if (!trip) return response.status(404).send("ID not found.");

  const index = tripList.indexOf(trip);
  tripList.splice(index, 1);
  response.send(trip);
});

/**
 * Route serving single weather record.
 * @name get/weather-records
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.get("/api/weather-records/:id", (request, response) => {
  const weatherData = weatherRecords.find(
    (elem) => elem.id === parseInt(request.params.id)
  );

  if (!weatherData) return response.status(404).send("ID not found.");

  response.send(weatherData);
});

/**
 * ****************************************************
 * Validation
 */

/**
 * validate a trip record
 * @name validateTrip
 * @function
 * @param {Object} trip - received trip record
 * @returns {Joi.ObjectSchema<any>} - validation result
 */
function validateTrip(trip) {
  const validationSchema = Joi.object({
    packagingList: Joi.array().items(Joi.string()),
    locations: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
      })
    ),
  });

  return validationSchema.validate(trip);
}

async function getLocationCoords(locationName) {
  const locationGeo = await fetchGeoNamesApi(locationName);

  if (!locationGeo || locationGeo.postalCodes.length == 0) return null;

  const result = {};
  result.lat = locationGeo.postalCodes[0].lat;
  result.lng = locationGeo.postalCodes[0].lng;
  return result;
}

async function fetchGeoNamesApi(locationName) {
  const urlParams = new URLSearchParams({
    username: apiCredentials.geoNames.key,
    placename: locationName,
  });

  try {
    const apiRes = await fetch(apiCredentials.geoNames.url + urlParams);

    if (apiRes?.ok) {
      const locationData = await apiRes.json();
      if (locationData) return locationData;
    } else throw new Error(`HTTP Code: ${apiRes?.status}`);
  } catch (error) {
    console.log("There was an error", error);
  }
}

async function getWeatherForecast(lat, lng) {
  const forecast = await fetchForecastWeatherBitApi(lat, lng);

  if (!forecast) return null;

  const result = [];

  for (forecastDay of forecast.data) {
    const day = {};
    day.temp = forecastDay.temp;
    day.weatherCode = forecastDay.weather.code;
    day.date = forecastDay.valid_date;
    result.push(day);
  }

  return result;
}

async function fetchForecastWeatherBitApi(lat, lng) {
  const urlParams = new URLSearchParams({
    key: apiCredentials.weatherBit.key,
    lat: lat,
    lon: lng,
    days: "16",
  });

  try {
    const apiRes = await fetch(apiCredentials.weatherBit.url + urlParams);

    if (apiRes?.ok) {
      const forecastData = await apiRes.json();
      if (forecastData) return forecastData;
    } else throw new Error(`HTTP Code: ${apiRes?.status}`);
  } catch (error) {
    console.log("There was an error", error);
  }
}

module.exports = { server, handleRequest };
