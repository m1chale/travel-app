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
