// Get saved redirect data
var redirects;
chrome.storage.sync.get('redirects', function(dataObject) {
	redirects = dataObject.redirects;
});

// Update when the redirects array is updated
chrome.storage.onChanged.addListener(function(changes, areaName) {
	if (areaName === 'sync' && 'redirects' in changes) {
		redirects = changes.redirects.newValue;
	}
});

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		var match, redirect;
		for (var i = 0; i < redirects.length; i++) {
			redirect = redirects[i];
			if (!redirect.pattern) continue; // Ignore empty patterns
			if (match = new RegExp('^(https?://)' + redirect.pattern + '.*(\\?.*)?', 'i').exec(details.url) ) {
				return {redirectUrl: match[1] + redirect.redirect + (match[2] || '')};
			}
		};
	},
	{urls: ["<all_urls>"]},
	["blocking"]
);

