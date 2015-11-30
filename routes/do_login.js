var express = require('express');
var router = express.Router();
var util = require('util');
var sess;


router.post('/', function(req, res, next) {
	sess = req.session;
	var result = {};

	// If already logged in ignore everything
	if (sess['logged_in_as']) {
		result['success'] = 1;
		res.send(result);
	}

	var username = req.param('username');
	var pwd = req.param('password');

	// Check if user exists
	// Check if password matches
	// Log in the user
	console.log("Got credentials", username, pwd);

	result['success'] = 1;

	res.send(result);
});

module.exports = router;