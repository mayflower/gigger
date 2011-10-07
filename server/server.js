/*
* Author: Felix Kaser <f.kaser@gmx.net>
* Copyright (c) 2011, Mayflower GmbH
* All rights reserved.
* 
* This software is distributed under the BSD 3-clause
* license. The full license can be found in ../LICENSE.
*/

var http = require("http"),
	faye = require("faye"),
	authenticator = require("./authenticator");

// log all warnings
faye.Logging.logLevel = 'warn';

// create new faye node
var bayeux = new faye.NodeAdapter({
		mount: "/faye",
		timeout: 45
	});
	
var serverAuth = {
	incoming: function(message, callback) {
		var closure = function(authenticated, cause) {
			var auth = message.ext && message.ext.auth;
			if (!authenticated) {
				cause = cause || 'no reason specified';
				faye.Logging.log(['message on ' + message.channel + ' not authenticated: ' + cause + " auth: " + auth], 'info');
				message.error = 'Not authenticated: ' + cause;
			} else {
				faye.Logging.log(['message on ' + message.channel + ' successfully authenticated: ' + auth], 'info');
			}
			callback(message);
		};
		
		if (message.channel === '/meta/subscribe') {
			// authenticate subscriptions to '/event/...' and '/dispatchRequest'
			var subscription = message.subscription;
			
			if (typeof(subscription) === 'string')
				subscription = [subscription];
			
			var authNeeded = false;
			for (var i in subscription) {
				if (subscription[i].substr(0, 7) === '/event/' ||
					subscription[i].substr(0, 16) === '/dispatchRequest') {
					authNeeded = true;
				}
			}
			
			if (authNeeded) {
				var authObject = message.ext && message.ext.auth;
				authenticator.authenticate(authObject, closure);
			} else {
				callback(message);
			}
		} else if (message.channel === '/dispatch') {
			// authenticate all dispatch messages
			var authObject = message.ext && message.ext.auth;
			authenticator.authenticate(authObject, closure);
		} else {
			callback(message);
		}
	}
};

bayeux.addExtension(serverAuth);

bayeux.listen(8000);

