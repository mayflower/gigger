/*
* Author: Felix Kaser <felix.kaser@mayflower.de>
*/

//module pattern
(function (callback) {

	//namespace
	var Gigger = {
		VERSION: "0.1"
	};
	
	//Class Gigger
	Gigger.Gigger = function(service) {
		this.client = new Faye.Client(service);
	};

	Gigger.Gigger.prototype = {
		/** Call this function to request updates on a specific event.
		 *  @param eventRequest: object containing path, element and event
		 *                       Example: {path: "/foo/bar.html", element: "some_id", event: "click" */
		requestEvent: function(eventRequest) {
			this.client.subscribe((eventRequest.path+"~"+eventRequest.element+"@"+eventRequest.event).replace(".", "$"), function(event) {
				console.log("event callback", event);
			});
			this.client.publish('/dispatch', eventRequest);
		},
		stop: function() {
			console.log("stop gigger");
		}
	};


	if (callback) {
		callback(Gigger);
	}

})(function (instance) {
	window.Gigger = instance;
});
