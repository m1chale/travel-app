/** Javascript for Website handling
 * @module client/scripts/app
 */

const apiTrips = require("../api/trips");
import { getPictureAsync } from "../api/pixabay";

// const Trip = require("./Trip.js");
// @ TODO import class somehow
class Trip {
  constructor() {
    this.locations = [];
    this.packagingList = [];
  }

  setPackagingList(list) {
    this.packagingList = [...list];
  }

  addLocation(location) {
    this.locations.push(location);
  }
}

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
function initApp(event) {
  refreshTripList();

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

  if (event.code == "Enter" && event.target.value != "") {
    if (checkForDuplicateItem(packagingList, event.target.value)) {
      const newItem = document.createElement("li");
      newItem.innerHTML = event.target.value;

      packagingList.insertAdjacentElement("beforeend", newItem);
    }
    event.target.value = "";
  }
}

/**
 * check if item already exists in list
 * @param {object} packagingList
 * @param {string} item
 */
function checkForDuplicateItem(packagingList, item) {
  for (listElem of packagingList.childNodes) {
    if (listElem.innerHTML == item) return false;
  }
  return true;
}

/**
 * save all inputs and generate a trip
 * @param {Event} event
 */
async function saveTripClick(event) {
  const trip = createTrip();
  // @TODO: validate that at least one location has been added

  await apiTrips.uploadTrip(trip);
  resetInputFields();

  refreshTripList();
}

/**
 * get all user inputs into a single trip object
 * @returns {Trip}
 */
function createTrip() {
  const trip = new Trip();
  const packagingList = document.getElementById("packaging-list");
  const locationRows = document.querySelectorAll(".fields");
  const packagingListItems = [];

  for (const item of packagingList.childNodes) {
    packagingListItems.push(item.innerHTML);
  }

  trip.setPackagingList(packagingListItems);

  for (const locationElement of locationRows) {
    const location = {};
    location.name = locationElement.children[0].firstElementChild.value;
    location.startDate = locationElement.children[1].firstElementChild.value;
    location.endDate = locationElement.children[2].firstElementChild.value;
    trip.addLocation(location);
  }

  return trip;
}

/**
 * reset all input fields back to default
 */
function resetInputFields() {
  document.getElementById("packaging-list").innerHTML = "";

  const locationRows = document.querySelectorAll(".fields");

  for (let i = 0; i < locationRows.length; i++) {
    if (i == 0) {
      locationRows[i].children[0].firstElementChild.value = "";
      locationRows[i].children[1].firstElementChild.value = "";
      locationRows[i].children[2].firstElementChild.value = "";
    } else {
      locationRows[i].remove();
    }
  }
}

async function refreshTripList() {
  const tripList = await apiTrips.getTrips();
  updateTripListUI(tripList);
}

function updateTripListUI(tripList) {
  const tripListWrapper = document.querySelector(".triplist-wrapper");

  if (!tripList.length > 0) {
    if (tripListWrapper) tripListWrapper.remove();
    return;
  }

  const tripListFragment = new DocumentFragment();
  const section = createTripListHeaderUI();

  tripListFragment.appendChild(section);

  for (const trip of tripList) {
    const tripWrapper = createTripInformationUI(trip);
    section.appendChild(tripWrapper);

    trip.locations.forEach((location) => {
      tripWrapper.appendChild(createLocationUI(location));
    });
  }

  // update dom

  if (tripListWrapper) {
    tripListWrapper.replaceWith(tripListFragment);
  } else {
    document.querySelector("main").appendChild(tripListFragment);
  }
}

function createTripListHeaderUI() {
  const section = document.createElement("section");
  const heading = document.createElement("h2");

  section.classList.add("triplist-wrapper");
  heading.innerText = "Triplist";

  section.appendChild(heading);

  return section;
}

function createTripInformationUI(trip) {
  const tripWrapper = document.createElement("div");
  const locationsHeading = document.createElement("h3");
  const row = document.createElement("div");
  const col = document.createElement("div");
  const tripDetails = document.createElement("div");
  const exportTrip = document.createElement("input");
  const cancelTrip = document.createElement("input");
  const packagingList = document.createElement("div");
  const items = document.createElement("ul");

  const countdown = Math.round(
    (new Date(trip.locations[0].startDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const tripLength = Math.round(
    (new Date(trip.locations[trip.locations.length - 1].endDate) -
      new Date(trip.locations[0].startDate)) /
      (1000 * 60 * 60 * 24)
  );

  tripWrapper.classList.add("trip-wrapper");

  locationsHeading.innerText = trip.locations.reduce(
    (namelist, currentLocation, idx) =>
      idx == 0 ? currentLocation.name : namelist + " - " + currentLocation.name,
    ""
  );
  tripWrapper.appendChild(locationsHeading);

  row.classList.add("row");
  tripWrapper.appendChild(row);

  col.classList.add("col");
  row.appendChild(col);

  tripDetails.classList.add("trip-details");
  tripDetails.innerHTML =
    `<div>Countdown</div><div>${countdown} days to go</div>` +
    `<div>Trip length</div><div>${tripLength} days</div>`;

  col.appendChild(tripDetails);

  exportTrip.value = "Export Trip";
  exportTrip.type = "button";
  col.appendChild(exportTrip);

  cancelTrip.value = "Cancel Trip";
  cancelTrip.type = "button";

  const tripId = trip.id;
  cancelTrip.onclick = async () => {
    await apiTrips.deleteTrip(tripId);
    refreshTripList();
  };

  col.appendChild(cancelTrip);

  packagingList.classList.add("list");
  packagingList.innerText = "Packaging List";
  packagingList.appendChild(items);

  for (const listItem of trip.packagingList) {
    const item = document.createElement("li");
    item.innerText = listItem;
    items.appendChild(item);
  }
  row.appendChild(packagingList);

  return tripWrapper;
}

function createLocationUI(location) {
  const locationWrapper = document.createElement("div");
  const locationHeading = document.createElement("h4");
  const locationImage = document.createElement("img");
  const weatherHeading = document.createElement("h4");
  const weatherWrapper = document.createElement("div");

  locationWrapper.classList.add("location-wrapper");

  locationHeading.innerText = location.name;
  locationWrapper.appendChild(locationHeading);

  locationImage.classList.add("location-img");
  getPictureAsync(location.name).then((result) => {
    locationImage.src = result;
  });

  locationWrapper.appendChild(locationImage);

  weatherHeading.innerText = "Weather";
  locationWrapper.appendChild(weatherHeading);

  weatherWrapper.classList.add("weather-wrapper");
  locationWrapper.appendChild(weatherWrapper);

  // for each day{
  //   if dayRowCnt = 0
  let currentRow;
  const dayCnt = 0;
  const row = document.createElement("div");
  row.classList.add("row");
  row.classList.add("center");
  weatherWrapper.appendChild(row);
  currentRow = row;

  // createDay
  const dayWrapper = document.createElement("div");
  const date = document.createElement("span");
  const weatherIcon = document.createElement("img");
  const temperature = document.createElement("span");

  dayWrapper.classList.add("day");
  currentRow.appendChild(dayWrapper);

  date.innerText = "25.01";
  dayWrapper.appendChild(date);

  dayWrapper.appendChild(weatherIcon);

  temperature.innerText = "20°C";
  dayWrapper.appendChild(temperature);

  return locationWrapper;
}

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

document.addEventListener("DOMContentLoaded", initApp);
