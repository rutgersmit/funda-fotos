// domRef is the div element of the house
function httpGetAsync(theUrl, domRef, callback) {
  console.log("httpGetAsync: " + theUrl);
  //theUrl = 'https://www.funda.nl/koop/laren-nh/huis-42252648-mauvezand-20/';
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    console.log("url: " + theUrl + " - onreadystatechange: " + xmlHttp.readyState + " - " + xmlHttp.status);
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      parseHouse(domRef, xmlHttp.responseText);
  };
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send(null);
}


// domRef is the div element of the house
function parseHouse(domRef, data) {
  //console.debug(domRef);
  if (domRef.parentElement.querySelectorAll('div[class="x"]').length > 0) {
    // some houses have already been upgraded, don't know why 🤷‍♀️
    return;
  }

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
    // we skip the first three because they are on the page already
    images = images.slice(3);
  } else {
    // we skip the first element because it is on the page already
    images.shift();
  }

  // for future use:  onclick="navigator.clipboard.writeText(\'lalala\').then(() => {}, () => {});"
  let html =
    '<div class="x" style="width: 100%; overflow-x: auto;"><div style="display: flex;">';
  images.forEach(function (img) {
    html +=
      "<a target='_blank' href='" +
      img +
      "' style='margin: 10px;'><img src='" +
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
function upgradeHouse(elem){
  //let querySelectorTag = 'div[class="search-result-media"]';
  let querySelectorTag = 'a';
  let url = elem.querySelector(querySelectorTag).href;
  //console.log(url);
  //elem.querySelector('h2').innerHTML += " - check";

  httpGetAsync(url, elem, parseHouse);
}

function startUpgrading(){
  //let querySelectorTag = 'div[class="search-result-content"], div[class="search-result-content-promo"]';
  let querySelectorTag = 'div[data-test-id="search-result-item"]';
  let elems = document.querySelectorAll(querySelectorTag);

  console.log(elems.length);
  for (var i = 0; i < elems.length; i++) {
    upgradeHouse(elems[i]);
  }
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
//let querySelectorTag = 'div[data-component="pagination"]';
let querySelectorTag =
  'ul[class="pagination pagination-mobile"], div[id^="vue-portal-target"]';

new MutationObserver(function () {
  console.log("Navigated");
  processChange();
}).observe(document.querySelector(querySelectorTag), {
  childList: true,
  subtree: true,
  attributes: true
});


startUpgrading();