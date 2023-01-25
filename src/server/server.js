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
// const tripList = [];
const tripList = JSON.parse(
  '[{"id":"e26e792b84061885b9b4840be37e6525","packagingList":[],"locations":[{"name":"Berlin","startDate":"2023-01-25","endDate":"2023-01-27","lat":52.5179,"lng":13.3759,"weatherForecast":[{"temp":-1.9,"weatherCode":804,"date":"2023-01-24"},{"temp":-1.4,"weatherCode":804,"date":"2023-01-25"},{"temp":-2.3,"weatherCode":803,"date":"2023-01-26"},{"temp":-1.4,"weatherCode":610,"date":"2023-01-27"},{"temp":0.3,"weatherCode":600,"date":"2023-01-28"},{"temp":0.3,"weatherCode":600,"date":"2023-01-29"},{"temp":3.4,"weatherCode":500,"date":"2023-01-30"}]},{"name":"Malta","startDate":"2023-01-28","endDate":"2023-02-20","lat":39.648212,"lng":-81.912746,"weatherForecast":[{"temp":1.3,"weatherCode":802,"date":"2023-01-24"},{"temp":3.4,"weatherCode":610,"date":"2023-01-25"},{"temp":-0.1,"weatherCode":600,"date":"2023-01-30"},{"temp":-1.8,"weatherCode":600,"date":"2023-01-31"},{"temp":2.3,"weatherCode":610,"date":"2023-02-01"},{"temp":2.1,"weatherCode":610,"date":"2023-02-02"},{"temp":-4.3,"weatherCode":623,"date":"2023-02-03"}]}]}]'
);

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
const apiKey = process.env.API_KEY;

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
app.listen(port, listening);

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
app.get("/api/trips", (request, response) => {
  response.send(tripList);
});

/**
 * Route accepting single weather record.
 * @name post/trips
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.post("/api/trips", (request, response) => {
  const { error } = validateTrip(request.body);

  if (error) return response.status(400).send(error.details[0].message);

  const trip = {
    id: crypto.randomBytes(16).toString("hex"),
    packagingList: request.body.packagingList,
    locations: request.body.locations,
  };

  // always store first location in beginning of array
  trip.locations.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  for (let i = 0; i < trip.locations.length; i++) {
    getLocationCoords(trip.locations[i].name).then((coords) => {
      trip.locations[i].lat = coords.lat;
      trip.locations[i].lng = coords.lng;

      getWeatherForecast(trip.locations[i].lat, trip.locations[i].lng).then(
        (weatherForecast) => {
          trip.locations[i].weatherForecast = weatherForecast;
        }
      );
    });
  }
  tripList.push(trip);

  tripList.sort(
    (a, b) =>
      new Date(a.locations[0].startDate).getTime() -
      new Date(b.locations[0].startDate).getTime()
  );

  response.send(trip);
});

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

  if (!locationGeo) return null;

  const result = {};
  result.lat = locationGeo.postalCodes[0].lat;
  result.lng = locationGeo.postalCodes[0].lng;
  return result;
}

async function fetchGeoNamesApi(locationName) {
  const url = `http://api.geonames.org/postalCodeSearchJSON?placename=${locationName}&username=_m1chael`;

  try {
    const apiRes = await fetch(url);

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
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lng}&days=16&key=6a0b38e6c8aa455fb0937f561344e923`;

  try {
    const apiRes = await fetch(url);

    if (apiRes?.ok) {
      const forecastData = await apiRes.json();
      if (forecastData) return forecastData;
    } else throw new Error(`HTTP Code: ${apiRes?.status}`);
  } catch (error) {
    console.log("There was an error", error);
  }
}
