import axios from "axios";
import config from '../frontend/config.json' with { type: 'json' };

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const addItem = async (key, value, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const params = {
        "tablename": "GalleryTable2",
        "description": value[1],
      }
      value[0].forEach(keyword => {
        params[keyword] = "T";
      });

      const response = await axios.post(`${config.api.invokeUrl}/${key}`, params, { timeout: 10000 });

      console.log(`Added Item ${key}`);
      return response;
    } catch (err) {
      if (attempt === retries) {
        console.error(`Failed to add item ${key} after ${retries} attempts:`, err.message);
        throw err;
      }

      console.log(`Attempt ${attempt} failed for item ${key}. Retrying...`);
      
      // Exponential backoff
      await delay(1000 * Math.pow(2, attempt));
    }
  }
}

const sequentialAddItems = async () => {
  let value = [['number'],'This is a temporary description'];
  for (let i = 0;i < 17;i+=1) {
    try {
      await addItem(i, value);
      await delay(500);
    } catch (err) {
      console.error(`Stopping process due to error with item ${key}`, err);
      break;
    }
  }
}

// Call the sequential processing function
await sequentialAddItems();