/*function chromeToEpochTime(chromeTime){
	return new Date(chromeTime/1000000-11644473600);
}*/
var urlMappings = {};

function parseDomain(_url){
	var matches = _url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
	return matches && matches[1];
}

function genFavicons(){
	dummyA = document.createElement('a');
	chrome.history.search({
		'text': '',
		'maxResults': 10000,
		'startTime': -1,
	}, function (historyItems){
		console.log(historyItems.length);
		for(var i = 0; i < historyItems.length; i++){
			var item = historyItems[i];
			
			// simplify domain name
			var domain = parseDomain(item.url);
			var faviconUrl;
			if(!(domain in urlMappings)){
				urlMappings[domain] = item.url;
			}
			faviconUrl = 'chrome://favicon/' + urlMappings[domain];
			var faviconDiv = document.createElement('div');
			var faviconTitle = item.title.replace("\"", "");
			faviconDiv.className = "faviconDiv";
			faviconDiv.innerHTML += '<a href="' + item.url + '"><img title="Title: ' + faviconTitle + '&#10;Visited on: ' + item.lastVisitTime + '" class="favicon" src="' + faviconUrl + '"></img></a>'
			document.getElementById('faviconHolder').appendChild(faviconDiv);
		}
		console.log("all done!");
	});
}

document.addEventListener('DOMContentLoaded', function () {
  genFavicons()
});