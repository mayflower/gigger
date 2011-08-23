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
		
		//register for a specific event and publish to dispatcher that we want to have it
		var eventRequest = {path: "/fayetest/webapp.html", element: "title_id", event: "click"};
		this.client.subscribe((eventRequest.path+"~"+eventRequest.element+"@"+eventRequest.event).replace(".", "$"), function(event) {
			console.log("event callback", event);
		});
		this.client.publish('/dispatch', eventRequest);
	};

	Gigger.Gigger.prototype = {
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
