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
		this.dispatch = this.client.subscribe('/dispatch', function(message) {
			console.log("dispatch got message:", message);
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
