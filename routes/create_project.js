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
		var nextFunction = tasks[0];
		tasks.shift();
		if (typeof(nextFunction) == "function") {
			nextFunction(self);
		}
	}

	self.addTask = function(task) {
		if (typeof(task) == "function") {
			tasks.push(task);
		}
	}

}

router.get('/', function(req, res, next) {
	sess = req.session;
	var data = {};
	var tm = new TasksClass();
	var usersColl = req.db.get('users');
	var projectsColl = req.db.get('projects');
	var interestsColl = req.db.get('interests');

	var ownerUsername = null;
	var p_int_id = null;

	// Get the firstname of logged in user
	if (sess['logged_in_as']) {
		data['login'] = false;
		tm.addTask(function() {
			usersColl.find({
				username: sess['logged_in_as']
			}, {}, function(err, users) {
				if (err) {
					result['success'] = 0;
					result['err_type'] = 'mongodb_error';
					result['err_msg'] = "Unknown Error Occured.";
					res.render('project', result);
				} else if (users.length <= 0) {
					result['success'] = 0;
					result['err_type'] = 'user_no_exists';
					result['err_msg'] = "User not found!";
					res.render('project', result);
				} else {
					// User exists, store the object
					console.log(users);
					data['firstname'] = users[0].firstname;
					data['surname'] = users[0].surname;
					data['reputation'] = users[0].reputation;
					tm.runNext();
				}
			})
		});
	} else {
		// Can't create project without log in, redirect to login page
		res.redirect('login');
	}

	// All the interests
	tm.addTask(function() {

		data['interest'] = [];
		interestsColl.find({}, {}, function(err, interests) {
			for (var i = 0; i < interests.length; i++) {
				data['interest'].push({
					id: interests[i].int_id,
					name: interests[i].int_name
				});
			}
			console.log(data['interest']);
			tm.runNext();
		});
	})

	tm.addTask(function() {
		res.render("create_project", data);
	});

	tm.runNext();

});

module.exports = router;