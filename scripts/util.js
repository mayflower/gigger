// define require.js module
define('util', ['md5'], function (md5) {
	
	console.log("module util loaded with md5: ", md5);
	
	var getChannelID = function(eventRequest) {
		var hashInput = [];
		
		// TODO: this should be done in a more generic way (loop over eventRequest?)
		if (eventRequest.path) hashInput.push("path: " + eventRequest.path);
		if (eventRequest.pathRegex) hashInput.push("pathRegex: " + eventRequest.pathRegex);
		if (eventRequest.tagName) hashInput.push("tagName: " + eventRequest.tagName);
		if (eventRequest.class) hashInput.push("class: " + eventRequest.class);
		if (eventRequest.element) hashInput.push("element: " + eventRequest.element);
		
		var ret = '/eventRequest/' + eventRequest.event + "/" + md5.MD5(hashInput.toString());
		console.log("generated channel id: " + ret + " for event: ", eventRequest, " and hashInput: " + hashInput);
		return ret;
	}
	
	// return exposed api
	return {
		getChannelID: getChannelID
	};
})
