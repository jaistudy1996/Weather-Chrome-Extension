// Global variables
var ERROR = "error";
var locationCords = {};
var openWeatherMapKey = 'bad43f7b54535ae3baeb52cbe1beff28';
var googleMapsApiKey = "AIzaSyDizy6zNKrzN5nSZF7uoDmV_UQZM4aEfUI";
var googelMapsLatLngKey = "AIzaSyD2gNxs_Kcp_QMcoEfndYw0L4ykMG3P-24";
var weatherUnits = "Metric";  //Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
// Get user's current location
function getLocation(){
	if("geolocation" in navigator && locationCords.lat == undefined && locationCords.lng == undefined){
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

  getWeather(locationCords); // call this funtion everytime we have new location cordinats.
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
 * @function getWeather
 * @param {object} _locationCords containing lat and lng properties respectively
 */
function getWeather(_locationCords){
  let xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  let url = `http://api.openweathermap.org/data/2.5/weather?lat=${_locationCords.lat}&lon=${_locationCords.lng}&units=${weatherUnits}&APPID=${openWeatherMapKey}`;
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


var omniboxSuggestionArray;
/**
 * @function omniboxSuggestions this funtion shows relevant suggestions in the chrome for locations
 * @param {string} user_input The string input by the user
 * @param {function} suggest this is the internal chrome funtion that shows suggestions in address bar
 */
function omniboxSuggestions(user_input, suggest){
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${user_input}&key=${googleMapsApiKey}`;
    xhr.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        console.log(xhr.response);
        let suggestions = [];
        for(let i=0; i<xhr.response.predictions.length; i++){
          suggestions.push({content: xhr.response.predictions[i].description, description: xhr.response.predictions[i].description});
        }
        suggest(suggestions);
      }
    }
    xhr.open("GET", url, true);
    xhr.send();
}

/**
 * @function getLatLngForSelectedSuggestion this function will get lat and lng for suggestion
 * @param {string} address string text
 * @param {string} action "change loc": change default location
 */
function getLatLngForSelectedSuggestion(address, action){
  let xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${googelMapsLatLngKey}`;
  xhr.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      console.log(xhr.response);
      let _locationCords = {};
      _locationCords.lat = xhr.response.results[0].geometry.location.lat;
      _locationCords.lng = xhr.response.results[0].geometry.location.lng;
      if(action === "change loc"){
        locationCords = _locationCords;
      }
      getWeather(_locationCords);
    }
  }
  xhr.open("GET", url, true);
  xhr.send();
}

/**
 * Add click listener to icon which will trigger getLocation to get new weather and new location.
 */
chrome.browserAction.onClicked.addListener(function(){
  getWeather(locationCords);
});

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    // suggest is a function that takes an array of objects containing content and description
    if(text.includes("change location ")){
      console.log(text.replace("change location ", ""));
      omniboxSuggestions(text.replace("change location ", ""), suggest, "change loc");
    }
    else if(text.includes("change units ")){
      suggest([
        {content: "F", description: "Fahrenheit"},
        {content: "C", description: "Celsius"},
        {content: "K", description: "Kelvin"}
      ]);
    }
    else{
      omniboxSuggestions(text, suggest);
    }

    console.log('inputChanged: ' + text);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
    // Change units and refresh weather.
    if(["F", "f"].indexOf(text.replace("change units ")[0]) > -1){
      weatherUnits = "Imperial";
      getWeather(locationCords);
      return;
    }
    else if(["C", "c"].indexOf(text.replace("change units ")[0]) > -1){
      weatherUnits = "Metric";
      getWeather(locationCords);
      return;
    }
    else if(["K", "k"].indexOf(text.replace("change units ")[0]) > -1){
      weatherUnits = "Default";
      getWeather(locationCords);
      return;
    }
    else{
      return;
    }
    getLatLngForSelectedSuggestion(text);
  });
