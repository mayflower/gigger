function authenticate(auth, callback) {
	if (auth && auth.user === 'test' && auth.password === 'gigger')
		callback(true);
	else
		callback(false, "no auth provided");
}

exports.authenticate = authenticate;
