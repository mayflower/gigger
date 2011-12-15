/*
* Author: Felix Kaser <f.kaser@gmx.net>
* Copyright (c) 2011, Mayflower GmbH
* All rights reserved.
* 
* This software is distributed under the BSD 3-clause
* license. The full license can be found in ../LICENSE.
*/

//require.js module pattern
define(["util", "faye"], function (util) {

	//namespace
	var Gigger = {
		VERSION: util.VERSION
	};
	
	var handleDispatchRequest = function(dispatchRequest) {
		for (i = 0; i<eventRequests.length; i++) {
			fayeClient.publish(dispatchRequest.uniqueChannelId, eventRequests[i].request);
			//console.log(eventRequests[i].request, "dispatched again");
		}
	}
	
	// global variables
	var eventRequests, fayeClient;
	
	//Class Gigger
	Gigger.Gigger = function(service, authObject) {
		fayeClient = new Faye.Client(service);
		
		// append authentication to some messages
		var clientAuth = {
			outgoing: function(message, callback) {
				var authNeeded = false;
				
				if (message.channel === '/meta/subscribe'){
					// authenticate subscriptions to '/event/...' and '/dispatchRequest'
					var subscription = message.subscription;
					
					if (typeof(subscription) === 'string')
						subscription = [subscription];
					
					for (var i in subscription) {
						if (subscription[i].substr(0, 7) === '/event/' ||
							subscription[i].substr(0, 16) === '/dispatchRequest') {
							authNeeded = true;
						}
					}
					
				} else if (message.channel === '/dispatch') {
					// authenticate all dispatch messages
					authNeeded = true;
				}

				// Add ext field if it's not present
				if (!message.ext) message.ext = {};

				if (authNeeded) {
					message.ext.auth = authObject;
				}

				// Carry on and send the message to the server
				callback(message);
			}
		};
		
		fayeClient.addExtension(clientAuth);
		this.client = fayeClient;
		// stores all event requests in an object
		eventRequests = new Array();
		this.eventRequests = eventRequests;
		
		// subscribe to dispatchRequests
		this.dispatchRequest = this.client.subscribe('/dispatchRequest', handleDispatchRequest);
	};

	Gigger.Gigger.prototype = {
		/** Call this function to request updates on a specific event.
		 *  @param eventRequest: object containing path, element and event
		 *                       Example: {path: "/foo/bar.html", element: "some_id", event: "click"
		 *  @param callback: the callback function to be called when events occur */
		requestEvent: function(eventRequest, callback) {
			// subscribe to the channel, store request for later and call the dispatcher
			var handle = this.client.subscribe(util.getChannelID(eventRequest), callback);
			eventRequests.push({handle: handle, request: eventRequest});
			fayeClient.publish('/dispatch', eventRequest);
		},
		/** Call this function to listen for events on some channel. This should be used
		 *  if the webapp is emitting custom events on a predefined channel.
		 *  @param channel: Channel to listen on for events
		 *  @param callback: the callback function to be called when events occur */
		addChannelListener: function(channel, callback) {
			fayeClient.subscribe(channel, callback);
		},
		stop: function() {
			//console.log("stop gigger");
			this.dispatchRequest.cancel();
			
			for (var i = 0; i < eventRequests.length; i++) {
				console.log(eventRequests[i].handle, "stop this");
			}
		}
	};

	return Gigger;

});
