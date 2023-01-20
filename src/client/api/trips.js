const url = "http://localhost:8090/api/trips";

/**
 * uploads a trip record to the server
 * @param {Trip} trip
 * @returns {object} server trip record
 */
export async function uploadTrip(trip) {
  try {
    const apiResponse = await fetch(url, {
      method: "POST",
      // credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trip),
    });

    if (apiResponse?.ok) {
      const tripResponse = await apiResponse.json();
      if (tripResponse) {
        return tripResponse;
      } else {
        throw new Error(`Data not in json format`);
      }
    } else
      throw new Error(
        `HTTP Code: ${
          apiResponse?.status
        } \n Error-Message: ${await apiResponse.text()}`
      );
  } catch (error) {
    console.log("error", error);
  }
}

/**
 * get all trips from server
 * @returns {Array} server trip records
 */
export async function getTrips() {
  const response = await fetch(url);
  console.log("getTrips");
  return response.json();
}

/**
 * deletes a trip record with the given id from the server
 * @param {Trip} trip
 * @returns {object} deleted trip record
 */
export async function deleteTrip(id) {
  try {
    const apiResponse = await fetch(url + `/${id}`, {
      method: "DELETE",
    });

    if (apiResponse?.ok) {
      const tripResponse = await apiResponse.json();
      if (tripResponse) {
        console.log("deleted");
        return tripResponse;
      } else {
        throw new Error(`Data not in json format`);
      }
    } else
      throw new Error(
        `HTTP Code: ${
          apiResponse?.status
        } \n Error-Message: ${await apiResponse.text()}`
      );
  } catch (error) {
    console.log("error", error);
  }
}
