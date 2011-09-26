var http = require("http"),
	faye = require("faye");

// log all infos
faye.Logging.logLevel = 'info';
faye.logger = function(msg) {
	console.log('logged: ' + msg);
}

// create new faye node
var bayeux = new faye.NodeAdapter({
		mount: "/faye",
		timeout: 45
	});

bayeux.listen(8000);

