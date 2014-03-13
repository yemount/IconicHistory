/*function chromeToEpochTime(chromeTime){
	return new Date(chromeTime/1000000-11644473600);
}*/
var urlMappings = {};
var divTimes = [];

function parseDomain(_url){
	var matches = _url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
	return matches && matches[1];
}

var m_names = new Array("Jan", "Feb", "Mar", 
"April", "May", "June", "July", "Aug", "Sep", 
"Oct", "Nov", "Dec");

var curTimestr = "";

var initialized = false;
var timeToggles = [false, false, false, false];

function filterByTime(period){
	var _period;
	if(period=='link0'){
		_period = 0;
	}
	else if(period == 'link1'){
		_period = 1;
	}
	else if(period == 'link2'){
		_period = 2;
	}
	else if(period == 'link3'){
		_period = 3;
	}
	timeToggles[_period] = ! timeToggles[_period];
	for(var i = 0; i < divTimes.length; i++){
	    var _div = divTimes[i][0];
	   	var _timestamp = divTimes[i][1];
    	var hour = _timestamp.getHours() + _timestamp.getMinutes()/60.0 + _timestamp.getSeconds()/3600.0;
    	var opacity = 0.05;
    	for(var _p = 0; _p < 4; _p++){
    		if (timeToggles[_p] && hour >= _p * 6 && hour <= (_p+1) * 6){
    			opacity = 1;
    		}
    	}
    	_div.style.opacity = opacity;
    }
    for(var _p = 0; _p < 4; _p++){
    	var _div = document.getElementById('link'+_p);
    	if(timeToggles[_p]){
    		_div.className = 'tableSpanSelected';
    	}
    	else{
    		_div.className = 'tableSpanDeselected';	
    	}
    }
}

function genFaviconDiv(){
	var faviconDiv = document.createElement('div');
	faviconDiv.className = "faviconDiv";
	return faviconDiv;
}

function genFavicons(){
	dummyA = document.createElement('a');
	chrome.history.search({
		'text': '',
		'maxResults': 100000,
		'startTime': -1,
	}, function (historyItems){
		historyItems.sort(function(a, b) {return a.lastVisitTime - b.lastVisitTime});
		for(var i = 0; i < historyItems.length; i++){
			var item = historyItems[i];
			
			// simplify domain name
			var domain = parseDomain(item.url);
			var faviconUrl;
			// cache favicons of the same domain
			if(!(domain in urlMappings)){
				urlMappings[domain] = [item.url, 1];
			}
			else{
				urlMappings[domain][1] += 1;
			}
			// create div for each favicon
			faviconUrl = 'chrome://favicon/' + urlMappings[domain][0];
			var faviconDiv = genFaviconDiv();
			var faviconTitle = item.title.replace(/\"/g, "");
			var timestamp = new Date(item.lastVisitTime);
			var timestr = m_names[timestamp.getMonth()] + " " + timestamp.getDate() + ", " + timestamp.getFullYear().toString().substring(2, 4);
			if(timestr != curTimestr){
				curTimestr = timestr;
				var _div = document.createElement('div');
				_div.innerHTML = timestr;
				_div.className += "dateDiv";
				document.getElementById('faviconHolder').appendChild(_div);
			}
			faviconDiv.innerHTML += '<a href="' + item.url + '"><img title="Title: ' + faviconTitle + '&#10;Visited on: ' + timestamp + '" class="favicon" src="' + faviconUrl + '"></img></a>';
			divTimes.push([faviconDiv, timestamp]);
			document.getElementById('faviconHolder').appendChild(faviconDiv);
		}

		// get most visited sites
		var sortedUrls = [];
		for(var url in urlMappings){
			sortedUrls.push([urlMappings[url][1], url]);
		}
		sortedUrls.sort(function(a, b) { return (b[0] - a[0]); });
		document.getElementById('topFavicons').innerHTML = '';
		for(var i = 0; i < 12; i++){
			var faviconDiv = genFaviconDiv();
			var faviconUrl = 'chrome://favicon/' + (urlMappings[sortedUrls[i][1]])[0];
			faviconDiv.innerHTML += '<img title="# Visits: ' + sortedUrls[i][0] + '" class="faviconTitle" src="' + faviconUrl + '"></img>';
			document.getElementById('topFavicons').appendChild(faviconDiv);
		}
	});
}

document.addEventListener('DOMContentLoaded', function () {
	for(var i = 0; i < 4; i++){
	  	document.getElementById('link'+i).onclick=function(){
	  		filterByTime(this.id);
	  	}
  	}
  	genFavicons()
});