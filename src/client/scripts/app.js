/** Javascript for Website handling
 * @module client/scripts/app
 */

/**
 * ****************************************************
 * Define Global Variables
 */

/**
 * End Global Variables
 *
 * ****************************************************
 * Start Helper Functions
 */

/**
 * Request weatherData from openWeather
 * @param {string} zip Zip code from city from which the weatherData will be requested
 * @returns {number} current temperature of requested zip-code
 */
async function getTemperature(zip) {
  const units = "metric";
  const url = `/api/open-weather-forwarder/${zip}/${units}`;
  try {
    const apiRes = await fetch(url);

    if (apiRes?.ok) {
      const weatherData = await apiRes.json();
      if (weatherData) return weatherData.main.temp;
    } else throw new Error(`HTTP Code: ${apiRes?.status}`);
  } catch (error) {
    console.log("There was an error", error);
  }
}

/**
 * Uploads the weather data to the server
 * @param {object} weatherData
 * @returns {boolean} true if upload finished without error
 */
async function uploadWeatherData(url, weatherData) {
  try {
    const apiRes = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      // Body data type must match "Content-Type" header
      body: JSON.stringify(weatherData),
    });
    if (apiRes?.ok) {
      const apiResWeatherData = await apiRes.json();

      if (apiResWeatherData) return true;
    } else
      throw new Error(
        `HTTP Code: ${apiRes?.status} \n Error-Message: ${await apiRes.text()}`
      );
  } catch (error) {
    console.log("error", error);
  }
}

/**
 * Gets the weather history data from the server
 * @returns {Array<object>} weather history
 */
async function getWeatherHistoryData(url) {
  try {
    const apiRes = await fetch(url);

    if (apiRes?.ok) {
      const weatherHistory = await apiRes.json();
      if (weatherHistory) return weatherHistory;
    } else throw new Error(`HTTP Code: ${apiRes?.status}`);
  } catch (error) {
    console.log("There was an error", error);
  }
}

/**
 * End Helper Functions
 *
 * ****************************************************
 * Begin Main Functions
 */

/**
 * initializing
 * @param {Event} event
 */
function documentLoaded(event) {
  const addLocation = document.getElementById("add-location");
  const saveTrip = document.getElementById("save-trip");
  const exportTrip = document.getElementById("export-trip");
  const cancelTrip = document.getElementById("cancel-trip");
  console.log("loaded");

  addLocation.addEventListener("click", addLocationClick);
  saveTrip.addEventListener("click", saveTrip);
  exportTrip.addEventListener("click", exportTrip);
  cancelTrip.addEventListener("click", cancelTrip);
}

/**
 * add another location to the current trip generation
 * @param {Event} event
 */
function addLocationClick(event) {
  let newLocation = document
    .querySelector(".input-form")
    .firstElementChild.cloneNode(true);

  console.log(newLocation.outerHTML);
  event.target.parentElement.insertAdjacentHTML(
    "beforebegin",
    newLocation.outerHTML
  );
}

/**
 * save all inputs to and generate a trip
 * @param {Event} event
 */
function saveTrip(event) {}

/**
 * export Trip to PDF
 * @param {Event} event
 */
function exportTrip(event) {}

/**
 * remove Trip from UI and database
 * @param {Event} event
 */
function cancelTrip(event) {}

/**
 * End Main Functions
 *
 * ****************************************************
 * Begin Events
 */

document.addEventListener("DOMContentLoaded", documentLoaded);
