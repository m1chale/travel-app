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
  const addItem = document.getElementById("add-item");
  const saveTrip = document.getElementById("save-trip");
  const exportTrip = document.getElementById("export-trip");
  const cancelTrip = document.getElementById("cancel-trip");

  addLocation.addEventListener("click", addLocationClick);
  addItem.addEventListener("keypress", addItemKeypress);
  saveTrip.addEventListener("click", saveTripClick);
  exportTrip.addEventListener("click", exportTripClick);
  cancelTrip.addEventListener("click", cancelTripClick);
}

/**
 * add another location to the current trip generation
 * @param {Event} event
 */
function addLocationClick(event) {
  // deep clone input fields
  const newLocation = document
    .querySelector(".input-form")
    .firstElementChild.cloneNode(true);

  // remove text-nodes (labels)
  const fieldWrapperList = newLocation.childNodes;
  fieldWrapperList.forEach((fieldWrapper) => {
    const childs = fieldWrapper.childNodes;
    childs.forEach((c) => c.nodeType === Node.TEXT_NODE && c.remove());
  });

  //insert newLocation in document
  event.target.parentElement.insertAdjacentHTML(
    "beforebegin",
    newLocation.outerHTML
  );
}

/**
 * save all inputs to and generate a trip
 * @param {Event} event
 */
function addItemKeypress(event) {
  const packagingList = document.getElementById("packaging-list");

  // @TODO
  // check input is not empty
  // check that item is not already in list

  if (event.code == "Enter") {
    const newItem = document.createElement("li");
    newItem.innerHTML = event.target.value;

    packagingList.insertAdjacentElement("beforeend", newItem);
    event.target.value = "";
  }
}

/**
 * save all inputs and generate a trip
 * @param {Event} event
 */
function saveTripClick(event) {}

/**
 * export Trip to PDF
 * @param {Event} event
 */
function exportTripClick(event) {}

/**
 * remove Trip from UI and database
 * @param {Event} event
 */
function cancelTripClick(event) {}

/**
 * End Main Functions
 *
 * ****************************************************
 * Begin Events
 */

document.addEventListener("DOMContentLoaded", documentLoaded);
