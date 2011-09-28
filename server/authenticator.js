function authenticate(auth, callback) {
	if (auth)
		callback(true);
	else
		callback(false, "no auth provided");
}

exports.authenticate = authenticate;
