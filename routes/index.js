var express = require('express');
var router = express.Router();
var sess;

/* GET home page. */
router.get('/', function(req, res, next) {
	sess = req.session;
	data = {
		login: true
	}
	if (sess['logged_in_as']) {
		data.login = false
	}
	res.render('index', data);
});

module.exports = router;