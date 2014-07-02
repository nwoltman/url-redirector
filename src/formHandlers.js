/**
 * formHandlers.js
 *
 * Code responsible for handling form setup input.
 */

var form = document.forms[0],
	inputs = form.elements,
	arrows = document.getElementsByClassName('arrow'),
	button = document.getElementsByTagName('button')[0],
	port = chrome.runtime.connect();
	
// Remove empty inputs when the form data changes
form.onchange = function(e) {
	// Loop through inputs two at a time (since they're in pairs) and always leave at least one pair, empty or not
	for (var i = 0; i < inputs.length && inputs.length > 2; i+=2) {
		var reqUrl = inputs[i].value,
			redirUrl = inputs[i + 1].value;
		// Remove empty pairs
		if (!reqUrl && !redirUrl) {
			inputs[i].remove();
			inputs[i].remove();
			arrows[i / 2].remove();
			i -= 2; // Subtract 2 from i so it will have the same value when the loop comes back around
		}
	};
};

// Save data to storage when the form receives a keyup event
// (This should be in onchange but that event won't run if the user closes to popup and there's no way to save to sync storage when popup closes)
form.onkeyup = function(e) {
	var data = [];

	// Loop through inputs two at a time (since they're in pairs) and build data array
	for (var i = 0; i < inputs.length; i+=2) {
		var reqUrl = inputs[i].value,
			redirUrl = inputs[i + 1].value;
		if (reqUrl || redirUrl) {
			data.push({pattern: reqUrl, redirect: redirUrl});
		}
	};

	// Save data to sync storage
	chrome.storage.sync.set({redirects: data});
};

// Add a new row if input text boxes when the button is clicked
button.onclick = function(e) {
	form.insertAdjacentHTML('beforeend', '<input type="text" /><span class="arrow">&rarr;</span><input type="text" />');
	inputs[inputs.length - 2].focus(); // Focus on the new "Requested URL" input text box
};

// Load saved data
chrome.storage.sync.get('redirects', function(dataObject) {
	var data = dataObject.redirects;
	
	for (var i = 0; i < data.length; i++) {
		form.insertAdjacentHTML('beforeend',
			'<input type="text" value="' + data[i].pattern + '" /><span class="arrow">&rarr;</span><input type="text" value="' + data[i].redirect + '" />');
	};
	
	// If no saved data was loaded, click the button to add a new empty row
	if (i === 0) {
		button.click();
		button.blur();
	}
});
