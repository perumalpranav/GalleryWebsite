import config from './config.json' with { type: 'json' };

const tablename = "GalleryTable2";
const directoryPath = "./pics2";

const getAll = async (tablename) =>{
  try {
    const params = {
      "tablename": tablename,
    }
    const response = await axios.post(`${config.api.invokeUrl}`, params);
    const keywordSet = new Set();
    const keywordNums = []; 


    Object.values(response.data).forEach(item => {
      let hasKeyword = "-";
      let hasId = "-"; 
      Object.entries(item).forEach(([key, value]) => {
        if (key == "id") {
          // Assuming the id is stored in the 'S' attribute for DynamoDB
          hasId = value.S;
        }
        if (key !== "description" && key !== "id") {
          keywordSet.add(key);
          hasKeyword = value.S === "T" ? key : "-";
        }
      });
      if (hasId !== "-") {
        keywordNums.push([hasId, hasKeyword]);
      }
    });
        
    const picArray = [];
    keywordNums.forEach(pair => {
      const picObject = {
        onekeyword: pair[1],
        path: `${directoryPath}/${pair[0]}.jpg`, // Added .jpg extension
        id: `${pair[0]}`,
      };
      picArray.push(picObject);
    });
    return [picArray, keywordSet];
  } catch (err) {
    console.log(`Attempt to scan has failed for table. This is the error: ${err}`);
    return [];
  }
}

const picInfo = await getAll(tablename);
console.log("picInfo", picInfo);

const searchBar = document.getElementById('searchbar');

searchBar.addEventListener('keyup', function(event) {
    if(event.key === "Enter") {
        console.log('Submit Query for: ', searchBar.value);
        const keyword = searchBar.value.trim().toLowerCase();
        if(picInfo[1].has(keyword)) {
          localStorage.setItem("keyword",keyword);
          window.location.href = "search.html"; //Immediately Kills and kicks execution to search.html
        }
        else {
          alert("This keyword isn't a part of the list, maybe add it to a word?");
        }
    }
});

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupImageTicker(picInfo);
    setupKeywordTicker(picInfo);
  });
} else {
  // DOM is already loaded
  setupImageTicker(picInfo);
  setupKeywordTicker(picInfo);
}

function setupImageTicker(picInfo) {
  const ticker = document.querySelector('.image-ticker ul');
  let images = [];

  for(let i = 0; i < picInfo[0].length; i++) {
    const listElement = document.createElement('li');
    const elemimg = document.createElement('img');
    elemimg.classList.add("tickerimg");
    elemimg.src = picInfo[0][i].path;
    elemimg.alt = picInfo[0][i].id;
    elemimg.title = picInfo[0][i].onekeyword;
    
    listElement.appendChild(elemimg);
    images.push(listElement);
  }

  images = images.concat(images.map(el => el.cloneNode(true)));
  images.forEach(el => ticker.appendChild(el));

  function updateTickerStyle() {
    const viewportHeight = window.innerHeight;
    const imageWidth = viewportHeight * 0.50; // 50vh
    const gap = 20;
    const totalWidth = (imageWidth + gap) * images.length;
    
    ticker.style.display = 'flex';
    ticker.style.gap = `${gap}px`;
    ticker.style.width = `${totalWidth}px`;
    ticker.style.listStyle = 'none';
    ticker.style.padding = '0';
    ticker.style.margin = '0';

    images.forEach(el => {
      el.style.flex = `0 0 ${imageWidth}px`;
      el.style.width = `${imageWidth}px`;
      el.style.height = 'auto';
    });

    const scrollSpeed = 400; // Pixels per second
    const duration = totalWidth / scrollSpeed;
    ticker.style.animationDuration = `${duration}s`;
  }

  // Initial update
  updateTickerStyle();

  // Update on window resize
  window.addEventListener('resize', updateTickerStyle);
}

function setupKeywordTicker(picInfo) {
  const keyticker = document.querySelector('.keyword-ticker ul');
  const allkeys = picInfo[1]; // Use the keyword set from picInfo
  console.log("keywords", allkeys);

  let words = [];

  for (let key of allkeys) {
    const listkey = document.createElement('li');
    listkey.textContent = key;
    words.push(listkey);
  }

  words = words.concat(words.map(el => el.cloneNode(true)));
  words.forEach(el => keyticker.appendChild(el));

  function updateTickerStyle() {
    const wordWidth = 100; // Fixed width for each word
    const gap = 20;
    const totalWidth = (wordWidth + gap) * words.length;

    keyticker.style.display = 'flex';
    keyticker.style.gap = `${gap}px`;
    keyticker.style.width = `${totalWidth}px`;
    keyticker.style.listStyle = 'none';
    keyticker.style.padding = '0';
    keyticker.style.margin = '0';

    words.forEach(el => {
      el.style.flex = `0 0 ${wordWidth}px`;
      el.style.width = `${wordWidth}px`;
    });

    const scrollSpeed = 100; // Pixels per second
    const duration = totalWidth / scrollSpeed;
    keyticker.style.animationDuration = `${duration}s`;
  }

  updateTickerStyle();
  window.addEventListener('resize', updateTickerStyle);
}