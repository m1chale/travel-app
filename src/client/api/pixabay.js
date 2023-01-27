const url = "http://localhost:8090/api/pixabay";

export async function getPictureAsync(keyword) {
  const apiCredentials = await getApiCredentials();

  const urlParams = new URLSearchParams({
    key: apiCredentials.key,
    image_type: "photo",
    category: "city",
    q: keyword,
  });

  const response = await fetch(apiCredentials.url + urlParams.toString());

  const resJson = await response.json();

  if (resJson.hits.length > 0) {
    return resJson.hits[0].webformatURL;
  } else {
    return "";
  }
}

/**
 * get all trips from server
 * @returns {Array} server trip records
 */
async function getApiCredentials() {
  const response = await fetch(url);
  return response.json();
}
