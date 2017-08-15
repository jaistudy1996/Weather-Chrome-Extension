// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

//TODO: add location refresh in settings.


console.log('hello');
//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });


var ERROR = "error";
var locationCords = {};
var openWeatherMapKey = 'bad43f7b54535ae3baeb52cbe1beff28';
var weatherUnits = "Metric";  //Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
// Get user's current location
function getLocation(){
	if("geolocation" in navigator){
		locationCords.status = "available";
		navigator.geolocation.getCurrentPosition(loc_success, loc_error);
	}
	else{
		locationCords.status = ERROR;
	}
}

/**
 * @function loc_success this function is a callback when locaitons are returned successfully
 */
function loc_success(position) {
	let lat = position.coords.latitude;
	let lng = position.coords.longitude;

	locationCords.lat = lat;
	locationCords.lng = lng;

  getWeather(); // call this funtion everytime we have new location cordinats.
}

/**
 * @function loc_error this function is a callback when there is an error with locations
 */
function loc_error() {
	locationCords.status = ERROR;
}

// run for the first time.
getLocation();

// set interval to check for location every 15 minutes.
var intvlGetLoc = setInterval(getLocation, 600000);

/**
 * This function will get latest weather update
 */
function getWeather(){
  let xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  let url = `http://api.openweathermap.org/data/2.5/weather?lat=${locationCords.lat}&lon=${locationCords.lng}&units=${weatherUnits}&APPID=${openWeatherMapKey}`;
  xhr.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      console.log(xhr.response);
      chrome.browserAction.setBadgeText({text: `${xhr.response.main.temp}${weatherUnits == "Metric" ? "C" : "F"}`});
      chrome.browserAction.setTitle({title: `${xhr.response.name}: ${xhr.response.main.temp_min}° - ${xhr.response.main.temp_max}°:  ${xhr.response.weather[0].description}`});
      chrome.browserAction.setIcon({path: `http://openweathermap.org/img/w/${xhr.response.weather[0].icon}.png`});
      chrome.browserAction.setBadgeBackgroundColor({color: [0,0,0,1]})
    }
  }
  xhr.open("GET", url, true);
  xhr.send();
}

/**
 * @function loadScript
 * Load Google maps api script.
 */
function loadScript(){
  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.defer = true;
  script.src = "https://maps.googleapis.com/maps/api/js";
  let head = document.getElementsByTagName("head")[0];
  head.appendChild(script);
}

loadScript();

/**
 * Add click listener to icon which will trigger getLocation to get new weather and new location.
 */
chrome.browserAction.onClicked.addListener(function(){
  getLocation();
});

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    suggest([
      {content: text + " one", description: "the first one"},
      {content: text + " number two", description: "the second entry"}
    ]);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
    alert('You just typed "' + text + '"');
  });
