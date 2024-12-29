// Import the database and fulllist object
import config from './config.json' with { type: 'json' };
//get config

const tablename = "GalleryTable2";
const directoryPath = "./pics2";

const piclayout = document.getElementById('piclayout');
let pictures;
let picIndex = 0;
const picWinNum = 3 //Number of pictures in window
const larrow = document.getElementById('larrow');
const rarrow = document.getElementById('rarrow');
let keyword = localStorage.getItem("keyword");

const searchBar = document.getElementById('searchbar');

searchBar.addEventListener('keyup', function(event) {
    if(event.key === "Enter") {
        console.log('Submit Query for: ', searchBar.value);
        const keyword = searchBar.value.trim().toLowerCase();
        clearpictures();
        displayPictures(keyword);
    }
});

rarrow.addEventListener('click', function() {
  console.log("right click");
  picIndex += picWinNum;
  //figure out looping index
  while(piclayout.firstChild) {
    piclayout.removeChild(piclayout.lastChild);
  }

  for(let i = 0; i < picWinNum; i++) {
    let k = (picIndex + i) % pictures.length;

    const imgwrapper = document.createElement('div');
    imgwrapper.classList.add("imgwrapper");

    const img = document.createElement('img');
    img.classList.add("picture");
    img.src = pictures[k].path;
    img.alt = pictures[k].id;
    imgwrapper.appendChild(img);

    imgwrapper.addEventListener('click', () => {
      //select image functionality
      console.log("showImageBigger" + pictures[k].id);
      showEnlargedImage(pictures[k],imgwrapper);
    });
    
    piclayout.appendChild(imgwrapper); //make a list not document body
  }
});

larrow.addEventListener('click', function() {
  console.log("left click");
  if(picIndex < picWinNum) {
    switch (picIndex) {
      case 0:
        picIndex = pictures.length - picWinNum;
        break;
      case 1:
        picIndex = pictures.length - (picWinNum-1);
        break;
      case 2:
        picIndex = pictures.length - (picWinNum-2);
        break;
    }
    //picIndex = 0 --> picIndex = length - picWinNum
    //picIndex = 1 --> picIndex = length - picWinNum - 1
    //picIndex = 2 --> picIndex = length - picWinNum - 2
  }
  picIndex -= picWinNum;
  //figure out looping index
  while(piclayout.firstChild) {
    piclayout.removeChild(piclayout.lastChild);
  }

  for(let i = 0; i < picWinNum; i++) {
    let k = (picIndex + i) % pictures.length;

    const imgwrapper = document.createElement('div');
    imgwrapper.classList.add("imgwrapper");

    const img = document.createElement('img');
    img.classList.add("picture");
    img.src = pictures[k].path;
    img.alt = pictures[k].id;
    imgwrapper.appendChild(img);

    imgwrapper.addEventListener('click', () => {
      //select image functionality
      console.log("showImageBigger" + pictures[k].id);
      showEnlargedImage(pictures[k],imgwrapper);
    });
    
    piclayout.appendChild(imgwrapper); //make a list not document body
  }
});

const getPictures = async (keyword) =>{
  try {
    const params = {
      "tablename": tablename,
      "keyword": keyword,
    }

    const response = await axios.post(`${config.api.invokeUrl}/key`, params);
    console.log(response);
    const pictures = transformDynamoDBResponse(response.data);
    return pictures;
  } catch (err) {
    console.log(`Attempt to scan has failed for keyword: ${keyword}.`);
    console.log(`This is the error: ${err}`);
  }
  return [];
}

function transformDynamoDBResponse(items) {
  return Object.values(items).map(item => ({
    description: item.description?.S || '',
    keywords: Object.keys(item).filter(key => item[key].S === 'T'),
    id: item.id?.S || '',
    path: `${directoryPath}/${item.id?.S || ''}.jpg`
  }));
}

const updateInfo = async (picObject) =>{
  try {
    const params = {
      "tablename": tablename, //CHANGE LATER
      "description": picObject.description,
    }
    picObject.keywords.forEach(keyword => {
      params[keyword.trim().toLowerCase()] = "T";
    });
    console.log(params);
    const response = await axios.post(`${config.api.invokeUrl}/${picObject.id}`, params); //change later
    return response;
  } catch (err) {
    console.log(`Failed to update item ${picObject.id} because of ${err}`);
  }
}

displayPictures(keyword);

// Function to display pictures based on a keyword
async function displayPictures(keyword) {
  pictures = await getPictures(keyword);
  console.log(pictures);
  if (pictures) {
    larrow.classList.remove("invis");
    larrow.classList.add("left");

    rarrow.classList.remove("invis");
    rarrow.classList.add("right");
    
    while(piclayout.firstChild) {
      piclayout.removeChild(piclayout.lastChild);
    }
    picIndex = 0;

    if(pictures.length <= picWinNum) {
      for(let i = 0; i < pictures.length; i++) {
        const imgwrapper = document.createElement('div');
        imgwrapper.classList.add("imgwrapper"); //only way to change imgwrapper styles

        const img = document.createElement('img');
        img.classList.add("picture");
        img.src = pictures[i].path;
        img.alt = pictures[i].id;
        imgwrapper.appendChild(img);

        imgwrapper.addEventListener('click', () => {
          //select image functionality
          console.log("showImageBigger" + pictures[i].id);
          showEnlargedImage(pictures[i],imgwrapper);
        });
        
        piclayout.appendChild(imgwrapper); //make a list not document body
      }
      larrow.classList.remove("left");
      larrow.classList.add("invis");
      rarrow.classList.remove("right");
      rarrow.classList.add("invis");
    }

    else if(pictures.length > picWinNum) {
      for(let i = 0; i < picWinNum; i++) {
        const imgwrapper = document.createElement('div');
        imgwrapper.classList.add("imgwrapper"); //only way to change imgwrapper styles

        const img = document.createElement('img');
        img.classList.add("picture");
        img.src = pictures[i].path;
        img.alt = pictures[i].id;
        imgwrapper.appendChild(img);

        imgwrapper.addEventListener('click', () => {
          //select image functionality
          console.log("showImageBigger" + pictures[i].id);
          showEnlargedImage(pictures[i],imgwrapper);
        });
        piclayout.appendChild(imgwrapper); //make a list not document body
      }
    }

  } else {
    clearpictures();
    console.log(`No pictures found for keyword: ${keyword}`);
  }
}

function showEnlargedImage(picObject,imgwrapper) {
  const overlay = document.createElement('div');
  overlay.classList.add("overlay");
      
  const content = document.createElement('div');  //WHOLE SELECTED BOX
  content.classList.add("content");
  overlay.appendChild(content);

  const cbutton = document.createElement('button'); //CLOSE BUTTON
  cbutton.innerHTML = "X";
  cbutton.classList.add("close-button");
  content.appendChild(cbutton);

  const leftbox = document.createElement('div');  //WHOLE LEFT BOX
  leftbox.classList.add("left-box");
  content.appendChild(leftbox);

  const img = document.createElement('img');  //LEFT BOX IMAGE
  img.src = picObject.path;
  img.alt = picObject.id;
  img.classList.add("left-box-image");
  leftbox.appendChild(img);

  const rightbox = document.createElement('div'); //WHOLE RIGHT BOX
  rightbox.classList.add("right-box");
  content.appendChild(rightbox);

  const topbox = document.createElement('div'); //RIGHT TOP BOX
  topbox.classList.add("top-box");
  rightbox.appendChild(topbox);

  const bottombox = document.createElement('div'); //RIGHT BOTTOM BOX
  bottombox.classList.add("bottom-box");
  rightbox.appendChild(bottombox);

  const header = document.createElement('h2'); //HEADER
  header.innerHTML = `Picture ${picObject.id}`;
  topbox.appendChild(header);

  const keywordsContainer = document.createElement('div'); //KEYWORD CONTAINER
  keywordsContainer.classList.add('keywords-container');
  topbox.appendChild(keywordsContainer);
  
  const keywordsList = document.createElement('ul'); //KEYWORD LIST
  keywordsList.classList.add('image-keywords');
  
  picObject.keywords.forEach(keyword => {
    const listItem = document.createElement('li'); //KEYWORD ITEM
    const input = document.createElement('input');
    input.value = keyword;

    const deleteButton = document.createElement('button'); //DELETE BUTTON
    deleteButton.classList.add('delete-keyword');
    deleteButton.textContent = 'x';
    deleteButton.addEventListener('click', () => keywordsList.removeChild(listItem));

    listItem.appendChild(input);
    listItem.appendChild(deleteButton);
    keywordsList.appendChild(listItem);
  });

  const addlistItem = document.createElement('li'); //PLUS ITEM
  const addButton = document.createElement('button'); //ADD BUTTON
  addButton.classList.add('add-keyword');
  addButton.textContent = '+';
  addlistItem.appendChild(addButton);
  keywordsList.appendChild(addlistItem);

  addButton.addEventListener('click', () => {
      const listItem = document.createElement('li');
      const input = document.createElement('input');
      input.value = "placeholder";

      const deleteButton = document.createElement('button'); //DELETE THIS KEYWORD
      deleteButton.classList.add('delete-keyword');
      deleteButton.textContent = 'x';
      deleteButton.addEventListener('click', () => keywordsList.removeChild(listItem));

      listItem.appendChild(input);
      listItem.appendChild(deleteButton);
      keywordsList.insertBefore(listItem, addlistItem);  
   });

  keywordsContainer.appendChild(keywordsList);


  //PULL DESCRIPTION FROM THE picObject, locally update visuals
  const textarea = document.createElement('textarea'); //PARAGRAPH
  textarea.value = picObject.description; 
  textarea.classList.add('styled-textarea'); 
  bottombox.appendChild(textarea); 

  //SAVE CHANGES IN DATABASE
  const savebutton = document.createElement('button'); //SAVE CHANGES BUTTON
  savebutton.innerHTML = "Save Changes";
  savebutton.addEventListener('click', (event) => {
    event.preventDefault(); 
    event.stopPropagation();
    picObject.description = textarea.value;
    const keywordsArray = Array.from(keywordsList.querySelectorAll('li')).map(listItem => {
      const input = listItem.querySelector('input');
      if(input && input.value != '+') {
        return input.value;
      }
    }).filter(keyword => keyword !== undefined);;
    picObject.keywords = keywordsArray;
    imgwrapper.removeChild(overlay);
    updateInfo(picObject);
  });
  bottombox.appendChild(savebutton);

  cbutton.addEventListener('click', (event) => { 
    event.stopPropagation();
    imgwrapper.removeChild(overlay);
  });

  overlay.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  imgwrapper.appendChild(overlay);
}


function clearpictures() {
  larrow.classList.remove("left");
  larrow.classList.add("invis");
  
  rarrow.classList.remove("right");
  rarrow.classList.add("invis");


  let children = piclayout.children;
  for (let i = 0; i < children.length; i++) {
    piclayout.removeChild(children[i]);
  }
}






