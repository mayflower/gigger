function authenticate(auth, callback) {
	console.log('got authentication request from: ', auth);
	
	if (auth)
		callback(true);
	else
		callback(false, "no auth provided");
}

exports.authenticate = authenticate;
