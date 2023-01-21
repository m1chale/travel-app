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
  '[{"id":"8d71647d2a91a2e76ce6eecc598d936f","packagingList":["Hat","Cap","Dog"],"locations":[{"name":"San Francisco","startDate":"2023-02-15","endDate":"2023-03-11"}]},{"id":"359b402af9a1c19564435ef402efd87d","packagingList":["Hallo","Pferd"],"locations":[{"name":"Seattle","startDate":"2023-01-25","endDate":"2023-01-31"},{"name":"Chicago","startDate":"2023-02-02","endDate":"2023-02-04"}]}]'
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
 * Open weather forwarder
 * @name get/open-weather-forwarder
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.get("/api/open-weather-forwarder/:zip/:units", (request, response) => {
  //request.query = sortBy=name
  fetchOpenWeather(request.params.zip, request.params.units).then(
    (weatherRecords) => {
      response.send(weatherRecords);
    }
  );
});

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

  tripList.push(trip);
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
 * Route updating single weather record.
 * @name put/weather-records
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.put("/api/weather-records/:id", (request, response) => {
  const weatherData = weatherRecords.find(
    (elem) => elem.id === parseInt(request.params.id)
  );

  if (!weatherData) return response.status(404).send("ID not found.");

  const { error } = validateWeatherData(request.body);

  if (error) return response.status(400).send(error.details[0].message);

  weatherData.date = request.body.date;
  weatherData.temperature = request.body.temperature;
  weatherData.feelings = request.body.feelings;

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

async function fetchOpenWeather(zip, units) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${zip}&units=${units}&appid=${apiKey}`;

  try {
    const apiRes = await fetch(url);

    if (apiRes?.ok) {
      const weatherData = await apiRes.json();
      if (weatherData) return weatherData;
    } else throw new Error(`HTTP Code: ${apiRes?.status}`);
  } catch (error) {
    console.log("There was an error", error);
  }
}
