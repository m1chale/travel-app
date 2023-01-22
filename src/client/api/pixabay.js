// const dotenv = require("dotenv");

// dotenv.config();

const url = "https://pixabay.com/api/?";

// const apiKey = process.env.API_KEY;
const apiKey = "27910411-fb49b209c8dd892f919329325";

export async function getPictureAsync(keyword) {
  const urlParams = new URLSearchParams({
    key: apiKey,
    image_type: "photo",
    category: "city",
    q: keyword,
  });

  const response = await fetch(url + urlParams.toString());

  const resJson = await response.json();

  if (resJson.hits.length > 0) {
    return resJson.hits[0].webformatURL;
  } else {
    return "";
  }
}
