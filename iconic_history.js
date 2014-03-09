/*function chromeToEpochTime(chromeTime){
	return new Date(chromeTime/1000000-11644473600);
}*/
var urlMappings = {};

function parseDomain(_url){
	var matches = _url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
	return matches && matches[1];
}

var m_names = new Array("Jan", "Feb", "Mar", 
"April", "May", "June", "July", "Aug", "Sep", 
"Oct", "Nov", "Dec");

var curTimestr = "";

function genFavicons(){
	dummyA = document.createElement('a');
	chrome.history.search({
		'text': '',
		'maxResults': 100000,
		'startTime': -1,
	}, function (historyItems){
		historyItems.sort(function(a, b) {return b.lastVisitTime - a.lastVisitTime});
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
			var faviconTitle = item.title.replace(/\"/g, "");
			faviconDiv.className = "faviconDiv";
			var timestamp = new Date(item.lastVisitTime);
			var timestr = m_names[timestamp.getMonth()] + " " + timestamp.getDate() + ", " + timestamp.getFullYear().toString().substring(2, 4);
			if(timestr != curTimestr){
				curTimestr = timestr;
				var _div = document.createElement('div');
				_div.innerHTML = timestr;
				_div.className += "dateDiv";
				document.getElementById('faviconHolder').appendChild(_div);
			}
			faviconDiv.innerHTML += '<a href="' + item.url + '"><img title="Title: ' + faviconTitle + '&#10;Visited on: ' + item.lastVisitTime + '" class="favicon" src="' + faviconUrl + '"></img></a>'
			document.getElementById('faviconHolder').appendChild(faviconDiv);
		}
	});
}

document.addEventListener('DOMContentLoaded', function () {
  genFavicons()
});