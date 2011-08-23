/*
* Author: Felix Kaser <felix.kaser@mayflower.de>
*/

//module pattern
(function (callback) {

	//namespace
	var Gigger = {
		VERSION: "0.1"
	};
	
	var rawInput = function rawInput(data)
	{
		console.log('RECV: ' + data);
	}

	var rawOutput = function rawOutput(data)
	{
		console.log('SENT: ' + data);
	}

	var onConnect = function onConnect(status)
	{
		if (status == Strophe.Status.CONNECTING) {
			console.log('Strophe is connecting.');
		} else if (status == Strophe.Status.CONNFAIL) {
			console.log('Strophe failed to connect.');
		} else if (status == Strophe.Status.DISCONNECTING) {
			console.log('Strophe is disconnecting.');
		} else if (status == Strophe.Status.DISCONNECTED) {
			console.log('Strophe is disconnected.');
		} else if (status == Strophe.Status.CONNECTED) {
			console.log('Strophe is connected.');
			//emit presence information, we are online
			this.send($pres());
		}
	}
	
	var handlePresence = function handlePresence(presence) {
		console.log(presence, $(presence).attr);
		// accept every presence subscription
		if(presence.attr("type") === "subscribe")
			this.send($pres({to: presence.attr("from"), type: "subscribed"}));
	}
	
	//Class Gigger
	Gigger.Gigger = function (service, jid, pw) {
		this.connection = new Strophe.Connection(service);
		this.connection.rawInput = rawInput;
		this.connection.rawOutput = rawOutput;
		
		//hook handlers
		this.connection.addHandler(handlePresence, null, "presence");
		this.connection.connect(jid, pw, onConnect);
	};

	Gigger.Gigger.prototype = {
		stop: function() {
			console.log("stop gigger");
			this.connection.disconnect();
		}
	};


	if (callback) {
		callback(Gigger);
	}

})(function (instance) {
	window.Gigger = instance;
});