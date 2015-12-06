var express = require('express');
var router = express.Router();
var util = require('util');
var sess;

router.get('/', function(req, res, next) {
	sess = req.session;

	sess['backUrl'] = req.headers.referer || '/';

	// If already logged in redirect to main page
	if (sess['logged_in_as']) {
		res.redirect(sess['backUrl']);
	}

	// Show log in page
	res.render('login');
});

module.exports = router;