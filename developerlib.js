/*
* Author: Felix Kaser <felix.kaser@mayflower.de>
*/

//Element Handler


//Gigger Module
(function (callback) {

	//namespace
	var Gigger = {
		VERSION: "0.1"
	};
	
	// global fayeClient
	var fayeClient;
	
	var handleDispatch = function(eventRequest) {
		console.log("dispatch got message:", eventRequest);
		
		var e = eventRequest;
		
		try {
			if (e.path != null) {
				//check if path is valid
				console.log('path', e.path);
				if (e.path != window.location.pathname) {
					console.log('not my event, dropping', e);
					return;
				}
			} else if (e.pathRegex != null){
				//check path regex
				console.log('pathRegex', e.pathRegex);
				if (window.location.pathname.match(e.pathRegex) == null) {
					console.log('not my event, dropping', e);
					return;
				}
			} else {
				throw 'neither path nor pathRegex was specified, dropping eventRequest';
			}
			
			var eventRequestChannel = (e.path+"~"+e.element+"@"+e.event).replace(".", "$");
			
			if (e.event != null) {
				// event was specified, must come with element, class or tagName
				var elements = [];
				if (e.element != null) {
					//lookup element and hook event
					console.log('element', e.element);
					
					// hack to make code more generic
					elements = [document.getElementById(e.element)];
					elements.length = 1;
				} else if (e.class != null) {
					//lookup class and hook event(s)
					console.log('class', e.class);
					
					elements = document.getElementsByClassName(e.class);
				} else if (e.tagName != null) {
					//lookup tag name and hook event(s)
					console.log('tagName', e.tagName);
					
					elements = document.getElementsByTagName(e.tagName);
				} else {
					throw 'events must come with element, class or tagName, dropping eventRequest';
				}
				
				// append event handler to all events
				for (var i = 0; i < elements.length; i++) {
					elements[i].addEventListener(e.event, function(event) {
						console.log("event callback", event);
						// append the timestamp to the original eventRequest
						e.timeStamp = event.timeStamp;
						fayeClient.publish(eventRequestChannel, e);
					});
				}
			} else if (e.customJS != null) {
				// TODO: eval custom js
				console.log('customJS', e.customJS);
			} else {
				throw 'neither event nor customJS specified, dropping eventRequest';
			}
		} catch (err) {
			console.error(err, e);
		}
	};

	//Class Gigger
	Gigger.Gigger = function(service) {
		fayeClient = new Faye.Client(service);
		this.client = fayeClient;
		this.dispatch = this.client.subscribe('/dispatch', handleDispatch);
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
