var http = require("http"),
	faye = require("faye"),
	authenticator = require("./authenticator");

// log all warnings
console.log("gigger server start");
faye.Logging.logLevel = 'warn';
faye.logger = function(msg) {
	console.log('logged: ' + msg);
}

// create new faye node
var bayeux = new faye.NodeAdapter({
		mount: "/faye",
		timeout: 45
	});
	
var serverAuth = {
	incoming: function(message, callback) {
		console.log("message: " + message.channel);
		var closure = function(authenticated, cause) {
			if (!authenticated) {
				cause = cause || 'no reason specified';
				console.log('not authenticated: ' + cause);
				message.error = 'Not authenticated: ' + cause;
			}
			callback(message);
		};
		
		// TODO: publish to /dispatch and subscribe to /eventRequest/* and /dispatchRequest needs auth
		
		if (message.channel === '/meta/subscribe') {
			// authenticate subscriptions to '/eventRequest/...'
			var subscription = message.subscription;
			
			if (typeof(subscription) === 'string')
				subscription = [subscription];
			
			var authNeeded = false;
			for (var i in subscription) {
				if (subscription[i].substr(0, 13) === '/eventRequest' ||
					subscription[i].substr(0, 16) === '/dispatchRequest') {
					authNeeded = true;
				}
			}
			
			if (authNeeded) {
				console.log("authentication requested on " + message.subscription)
				var authObject = message.ext && message.ext.auth;
				authenticator.authenticate(authObject, closure);
			} else {
				console.log("no authentication requested...passing through")
				callback(message);
			}
		} else if (message.channel === '/dispatch') {
			// authenticate all dispatch messages
			console.log("authentication requested on dispatch")
			var authObject = message.ext && message.ext.auth;
			authenticator.authenticate(authObject, closure);
		} else {
			console.log("no authentication requested...passing through")
			callback(message);
		}
	}
};

bayeux.addExtension(serverAuth);

bayeux.listen(8000);

