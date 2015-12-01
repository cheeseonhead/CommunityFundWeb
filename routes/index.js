var express = require('express');
var router = express.Router();
var sess;

/* GET home page. */
router.get('/', function(req, res, next) {
	sess = req.session;
	var usersColl = req.db.get('users');

	data = {
		login: true
	}

	if (sess['logged_in_as']) {

		usersColl.find({
			username: sess['logged_in_as']
		}, {}, function(err, users) {
			if (err) {
				result['success'] = 0;
				result['err_type'] = 'mongodb_error';
				result['err_msg'] = "Unknown Error Occured.";
				res.send(result);
			} else if (users.length <= 0) {
				result['success'] = 0;
				result['err_type'] = 'user_no_exists';
				result['err_msg'] = "This username is not registered.";
				res.send(result);
			} else {
				data.firstname = users[0].firstname;
				data.login = false
				res.render('index', data);
			}
		});
	} else {
		res.render('index', data);
	}
});

module.exports = router;