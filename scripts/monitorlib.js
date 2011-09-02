/*
* Author: Felix Kaser <felix.kaser@mayflower.de>
*/

//require.js module pattern
define(["http://faye.node.vm:8000/faye.js"], function () {

	//namespace
	var Gigger = {
		VERSION: "0.1"
	};
	
	var handleDispatchRequest = function(dispatchRequest) {
		for (i = 0; i<eventRequests.length; i++) {
			fayeClient.publish(dispatchRequest.uniqueChannelId, eventRequests[i].request);
			console.log(eventRequests[i].request, "dispatched again");
		}
	}
	
	// global variables
	var eventRequests, fayeClient;
	
	//Class Gigger
	Gigger.Gigger = function(service) {
		fayeClient = new Faye.Client(service);
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
			var handle = this.client.subscribe((eventRequest.path+"~"+eventRequest.element+"@"+eventRequest.event).replace(".", "$"), callback);
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
			console.log("stop gigger");
			this.dispatchRequest.cancel();
			
			for (i = 0; i<=eventRequests.length; i++) {
				console.log(eventRequests[i].handle, "stop this");
			}
		}
	};

	return {
		Gigger: Gigger
	};

});
