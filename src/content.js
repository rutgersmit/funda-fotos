// domRef is the div element of the house
function httpGetAsync(theUrl, domRef, callback) {
  //theUrl = 'https://www.funda.nl/koop/laren-nh/huis-42252648-mauvezand-20/';
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      parseHouse(domRef, xmlHttp.responseText);
  };
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send(null);
}


// domRef is the div element of the house
function parseHouse(domRef, data) {
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

  // we skip the first element because it is on the page already
  images.shift();

  let html =
    '<div style="width: 100%; overflow-x: auto;"><div style="display: flex;" onclick="navigator.clipboard.writeText(\'lalala\').then(() => {}, () => {});">';
  images.forEach(function (img) {
    html +=
      "<a target='_blank' href='" +
      img +
      "' style='margin: 10px;'><img src='" +
      img.replace("1440x960", "360x240") +
      "' style='width: 360px; height: 240px; max-width: initial;'/></a>";
  });
  html += "</div></div>";
  images = [];

  let div = document.createElement("div");
  div.innerHTML = html;
  domRef.parentElement.appendChild(div);
}


// elem is the div element of the house
function upgradeHouse(elem){
  let url = elem.querySelector('a[data-test-id="object-image-link"]').href;
  //console.log(url);
  //elem.querySelector('h2').innerHTML += " - check";

  httpGetAsync(url, elem, parseHouse);
}

function startUpgrading(){
  let elems = document.querySelectorAll(
    'div[data-test-id="search-result-item"]'
  );

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
new MutationObserver(function () {
  processChange();
}).observe(document.querySelector('div[id^="vue-portal-target"]'), {
  childList: true,
  subtree: true,
});


startUpgrading();