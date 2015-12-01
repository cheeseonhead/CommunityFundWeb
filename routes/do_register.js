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
		tasks.shift();
	}

	self.addTask = function(task) {
		if (typeof(task) == "function") {
			tasks.push(task);
		}
	}

}

router.post('/', function(req, res, next) {
	// router.get('/', function(req, res, next) {
	sess = req.session;
	var result = {};
	var Tasks = new TasksClass();
	var usersColl = req.db.get('users');

	// If already logged in ignore everything
	if (sess['logged_in_as']) {
		result['success'] = 1;
		res.send(result);
	}

	var username = req.body['reg_username'];
	var pwd = req.body['reg_password'];
	var firstname = req.body['reg_firstname'];
	var surname = req.body['reg_surname'];

	// Check if all params are given
	if (!username || !pwd || !firstname || !surname) {
		result['success'] = 0;
		result['err_type'] = 'missing_field';
		result['err_msg'] = "One or more fields are missing.";
		res.send(result);
	}

	// Check if user exists
	Tasks.addTask(function() {
		usersColl.find({
			username: username
		}, "username", function(err, users) {
			if (err) {
				result['success'] = 0;
				result['err_type'] = 'mongodb_error';
				result['err_msg'] = "Unknown Error Occured.";
				res.send(result);
			} else if (users.length > 0) {
				result['success'] = 0;
				result['err_type'] = 'user_already_exists';
				result['err_msg'] = "Username is already taken.";
				res.send(result);
			} else {
				Tasks.runNext();
			}
		});
	});

	Tasks.addTask(function() {
		usersColl.insert({
			username: username,
			pwd: pwd,
			firstname: firstname,
			surname: surname,
			country: "",
			reputation: 0
		}, function(err, qRes) {
			if (err) {
				result['success'] = 0;
				result['err_type'] = 'mongodb_error';
				result['err_msg'] = "Unknown Error Occured.";
				res.send(result);
			} else {
				result['success'] = 1;
				result['res'] = qRes;
				res.send(result);
			}
		});
	});

	Tasks.runNext();
	// console.log("Got credentials", username, pwd);

	// result['success'] = 1;

	// res.send(result);
});

module.exports = router;