let LOG = false;
// domRef is the div element of the house
function httpGetAsync(houseId, theUrl, domRef, callback) {
  log("[" + houseId + "] Get " + theUrl);
  //theUrl = 'https://www.funda.nl/koop/laren-nh/huis-42252648-mauvezand-20/';
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    //log("url: " + theUrl + " - onreadystatechange: " + xmlHttp.readyState + " - " + xmlHttp.status);
    if (xmlHttp.readyState == 4){
      if (xmlHttp.status == 200)
        parseHouse(houseId, domRef, xmlHttp.responseText);
      else if (xmlHttp.status == 404 || xmlHttp.status == 410)
        houseDoesNotExist(houseId, domRef);
    }
  };

  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send(null);
}


function houseDoesNotExist(houseId, domRef) {
  log("["+ houseId+"] House does not exist (yet)");

  let html =
    '<div class="x" style="width: 100%; overflow-x: auto;"><div style="display: flex;" title="of Funda werkt even niet mee">';
  html += "Huis bestaat nog niet helemaal (Funda werkt even niet mee)";
  html += "</div></div>";

  let div = document.createElement("div");
  div.innerHTML = html;
  domRef.parentElement.appendChild(div);
}


// domRef is the div element of the house
function parseHouse(houseId, domRef, data) {
  if (domRef.parentElement.querySelectorAll('div[class="x"]').length > 0) {
    //domRef.parentElement.querySelectorAll('div[class="x"]')[0].remove();
    // some houses have already been upgraded, don't know why 🤷‍♀️
    log("["+ houseId+"] Already upgraded");
    return;
  }

  log("["+ houseId+"] Parse house data");

  // make an empty array to store the images
  let images = [];

  let parser = new DOMParser();
  let domObj = parser.parseFromString(data, "text/html");

  domObj
    .querySelectorAll('img[class="media-viewer-overview__section-image"]')
    .forEach(function (img) {
      // skip the 360 and floorplan images
      let alt = img.getAttribute("alt").toLowerCase();
      if (alt.indexOf("360") >= 0 || alt.indexOf("plattegrond") >= 0) return;

      images.push(img.getAttribute("data-lazy"));
    });

  if (domRef.parentElement.querySelectorAll("header").length > 0) {
    // we skip the first three because they are on the page already (promoted houses)
    images = images.slice(3);
  } else {
    // we skip the first element because it is on the page already
    images.shift();
  }

  log("[" + houseId + "] Adding " + images.length + " images");

  let html =
    '<div class="x" style="width: 100%; overflow-x: auto;"><div style="display: flex;">';
  images.forEach(function (img) {
    html += "<a target='_blank' href='" + img + "' style='margin: 10px;'><img src='" +
      img.replace("1440x960", "360x240") +
      "' style='width: 360px; height: 240px; max-width: initial;'/></a>";
  });

  if (images.length == 0) {
    html += "Geen extra foto's beschikbaar";
  }

  html += "</div></div>";
  images = [];

  let div = document.createElement("div");
  div.innerHTML = html;
  domRef.parentElement.appendChild(div);
}


// elem is the div element of the house
function upgradeHouse(houseId, elem) {
  //let querySelectorTag = 'div[class="search-result-media"]';

  let url = "https://www.funda.nl/" + houseId;

  log("[" + houseId + "] Upgrade via " + url);
  elem.querySelector('h2').innerHTML += " 🏳️";

  httpGetAsync(houseId, url, elem, parseHouse);
}


function startUpgrading(){
  //let querySelectorTag = 'div[class="search-result-content"], div[class="search-result-content-promo"]';
  let querySelectorTag = 'div[data-test-id="search-result-item"]';
  let elems = document.querySelectorAll(querySelectorTag);

  count = elems.length;
  log(elems.length + " houses found");
  for (var i = 0; i < elems.length; i++) {
    let houseId = elems[i]
      .querySelector("a")
      .href.match(/(?:huis|appartement)-(\d+)/)[1];
    log("[" + houseId + "] Found");
    // from the variable url, print the number after the word 'huis-'
    upgradeHouse(houseId, elems[i]);
  }
}


function log(message) {
  if(LOG)
    console.log(message);
}


function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}


const processChange = debounce(() => startUpgrading());
//let querySelectorTag = 'ul[class="pagination pagination-mobile"]';
//let querySelectorTag = 'div[componentid="search_result"]';
let querySelectorTag = 'div[id^="vue-portal-target"]';
new MutationObserver(function () {
  log("Navigated");
  processChange();
}).observe(document.querySelector(querySelectorTag), {
  childList: true,
  subtree: true,
  attributes: true
});

log("Funda Image Upgrader started");

startUpgrading();