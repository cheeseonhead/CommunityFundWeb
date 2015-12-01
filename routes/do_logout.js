var express = require('express');
var router = express.Router();
var util = require('util');
var sess;

router.get('/', function(req, res, next) {
	sess = req.session;

	if (sess['logged_in_as']) {
		delete sess.logged_in_as;
	}

	res.redirect('/');
});

module.exports = router;