const axios = require("axios");
const sleep = require("../utils/sleep");
const sign = require("../core/signer");
const {
  BASE_URL,
  API_PATH,
  TOKEN,
  MAX_RETRIES
} = require("../config/env");

async function fetchBatch(snList, attempt = 1) {
  const timestamp = Date.now().toString();
  const signature = sign(API_PATH, TOKEN, timestamp);

  try {
    const response = await axios.post(
      BASE_URL + API_PATH,
      { sn_list: snList },
      {
        headers: {
          timestamp,
          signature
        }
      }
    );

    return response.data;
  } catch (err) {
    const status = err.response?.status;

    if ((status === 429 || !status) && attempt <= MAX_RETRIES) {
      await sleep(1000 * attempt); // exponential backoff
      return fetchBatch(snList, attempt + 1);
    }

    throw err;
  }
}

module.exports = fetchBatch;
