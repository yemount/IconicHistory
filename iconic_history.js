/*function chromeToEpochTime(chromeTime){
	return new Date(chromeTime/1000000-11644473600);
}*/
var urlMappings = {};
var divsInfo = [];

var timeTStr = '_ih_t_time';

function parseDomain(_url){
	var matches = _url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
	return matches && matches[1];
}

var m_names = new Array("Jan", "Feb", "Mar", 
"April", "May", "June", "July", "Aug", "Sep", 
"Oct", "Nov", "Dec");

var curTimestr = "";

var resetted = true;
var timeToggles = {};
var siteToggles = {};

function filter(id){
	if(id.indexOf(timeTStr) != -1){
		// time toggle clicked
		timeToggles[id] = !timeToggles[id];
	}
	else{
		siteToggles[id] = !siteToggles[id];
	}
	// loop through favicon divs and adjust opacity according to filters
	for(var i = 0; i < divsInfo.length; i++){
	    var _div = divsInfo[i][0];
	    var timeAllDisabled = true;
	    var timePassed = false;
	    var siteAllDisabled = true;
	    var sitePassed = false;
	    for(var tToggle in timeToggles){
	    	if(!timeToggles[tToggle]){
	    		continue;	// tToggle deactivated
	    	}
	    	timeAllDisabled = false;
	    	var _p = parseInt(tToggle);
		   	var _timestamp = divsInfo[i][1];
	    	var hour = _timestamp.getHours() + _timestamp.getMinutes()/60.0 + _timestamp.getSeconds()/3600.0;
	    	if (hour >= _p * 6 && hour <= (_p+1) * 6){	// check if in selected time range
	    		timePassed = true;
				break;	// selected!
			}
    	}
    	for(var sToggle in siteToggles){
    		if(!siteToggles[sToggle]){
    			continue;	// sToggle deactivated
    		}
    		siteAllDisabled = false;
    		if(divsInfo[i][2] == urlMappings[sToggle][2]){	// check if domainId matches that of selected site
    			sitePassed = true;
    			break; // selected!
    		}
    	}
    	_div.style.opacity = (timeAllDisabled || timePassed) && (siteAllDisabled || sitePassed) ? 1 : 0.1;
    }
    // set opacity of filter icons
	for(var tToggle in timeToggles){
	    var _div = document.getElementById(tToggle);
	    _div.className = timeToggles[tToggle] ? 'toggleSelected' : 'toggleDeselected';	
	}
	for(var sToggle in siteToggles){
		var _div = document.getElementById(sToggle);
	    _div.className = siteToggles[sToggle] ? 'faviconDiv toggleSelected' : 'faviconDiv toggleDeselected';	
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
		var domainId = 0;
		for(var i = 0; i < historyItems.length; i++){
			var _myDomainId;
			var item = historyItems[i];
			
			// simplify domain name
			var domain = parseDomain(item.url);
			var faviconUrl;
			// cache favicons of the same domain
			if(!(domain in urlMappings)){
				if(domain == undefined){
					continue;
				}
				_myDomainId = domainId;
				urlMappings[domain] = [item.url, 1, domainId++];	// [raw favicon url, #visits, domainId]
				
			}
			else{
				urlMappings[domain][1] += 1;
				_myDomainId = urlMappings[domain][2];
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
			divsInfo.push([faviconDiv, timestamp, _myDomainId]);	// [the div, timestamp, domainId]
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
			var domain = sortedUrls[i][1];
			var faviconUrl = 'chrome://favicon/' + (urlMappings[domain])[0];
			var tooltipStr = domain + '&#10;' + '# Visits: ' + sortedUrls[i][0];
			faviconDiv.setAttribute('id', domain);
			faviconDiv.innerHTML += '<a href="#"><img title="' + tooltipStr + '" class="faviconTitle" src="' + faviconUrl + '"></img></a>';
			faviconDiv.onclick=function(){
				filter(this.id);
			}
			document.getElementById('topFavicons').appendChild(faviconDiv);
			faviconDiv.className += ' toggleDeselected';
			siteToggles[domain] = false;
		}
	});
}

document.addEventListener('DOMContentLoaded', function () {
	for(var i = 0; i < 4; i++){
		timeToggles[i+timeTStr] = false;
	  	document.getElementById(i+timeTStr).onclick=function(){
	  		filter(this.id);
	  	}
  	}
  	genFavicons()
});