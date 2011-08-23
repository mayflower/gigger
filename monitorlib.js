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
		this.client.publish('/dispatch', {url: "localhost/fayetest", element: "body", event: "onClick"});
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
