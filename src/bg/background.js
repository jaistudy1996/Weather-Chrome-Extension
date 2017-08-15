// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

console.log('hello');
//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });


var ERROR = "error";
var locationCords = {};
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

  console.log(locationCords);
}

/**
 * @function loc_error this function is a callback when there is an error with locations
 */
function loc_error() {
	locationCords.status = ERROR;
}

getLocation();
