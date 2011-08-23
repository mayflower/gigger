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
		var myclient = this.client;
		this.dispatch = this.client.subscribe('/dispatch', function(eventRequest) {
			console.log("dispatch got message:", eventRequest);
			if (eventRequest.url != window.location.path) {
				console.error("got a dispatch but it is not for me");
				return;
			} else {
				// look for the element id and hook the signal
				var element = document.getElementById(eventRequest.element);
				element.addEventListener(eventRequest.event, function(event) {
					console.log("event callback", event);
					// append the timestamp to the original eventRequest
					eventRequest.timeStamp = event.timeStamp;
					myclient.publish((eventRequest.path+"~"+eventRequest.element+"@"+eventRequest.event).replace(".", "$"), eventRequest);
				});
			}
		});
	};

	Gigger.Gigger.prototype = {
		stop: function() {
			console.log("stop gigger");
			this.dispatch.cancel();
		}
	};


	if (callback) {
		callback(Gigger);
	}

})(function (instance) {
	window.Gigger = instance;
});
