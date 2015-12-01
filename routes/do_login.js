var express = require('express');
var router = express.Router();
var util = require('util');
var sess;

var TasksClass = function() {
	var self = this;
	var tasks = [];
	var scopes = [];
	var pnt = 0;

	self.runNext = function() {
		if (tasks.length <= 0) return;
		if (typeof(tasks[0]) == "function") {
			tasks[0]();
		}
		tasks.pop();
	}

	self.addTask = function(task) {
		if (typeof(task) == "function") {
			tasks.push(task);
		}
	}

}

router.post('/', function(req, res, next) {
	sess = req.session;
	var result = {};
	var Tasks = new TasksClass();
	var usersColl = req.db.get('users');

	// If already logged in ignore everything
	if (sess['logged_in_as']) {
		result['success'] = 1;
		res.send(result);
	}

	var username = req.body.username;
	var pwd = req.body.password;

	if (!username || !pwd) {
		result['success'] = 0;
		result['err_type'] = 'missing_field';
		result['err_msg'] = "One or more fields are missing.";
		res.send(result);
	}

	// Check if user exists
	Tasks.addTask(function() {
		usersColl.find({
			username: username
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
				// User exists, check password
				if (users[0].pwd == pwd) {
					sess['logged_in_as'] = users[0].username;
					result['success'] = 1;
					res.send(result);
				} else {
					result['success'] = 0;
					result['err_type'] = 'wrong_password';
					result['err_msg'] = "The password is not correct.";
					res.send(result);
				}
			}
		});
	});

	Tasks.runNext();

	// Log in the user
	// console.log("Got credentials", username, pwd);

	// result['success'] = 1;

	// res.send(result);
});

module.exports = router;