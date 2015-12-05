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
	var targetUser = "";
	var targetUserObj = null;
	var showSelf = false; // See if this page is logged in user's
	var data = {};
	var result = {};
	var Tasks = new TasksClass();
	var usersColl = req.db.get('users');
	var projectsColl = req.db.get('projects');
	var interestsColl = req.db.get('interests');
	var countriesColl = req.db.get('countries');

	// Check if which username is specified
	if (req.query.username) {
		// Specified! Store it
		console.log("Hello1");
		targetUser = req.query.username;
	} else if (sess['logged_in_as']) {
		// Show logged in user
		console.log("Hello2");
		targetUser = sess['logged_in_as'];
	} else {
		// Can't show anything go back to main page
		res.redirect('/');
		return;
	}

	if (targetUser == sess['logged_in_as']) {
		data['show_self'] = true;
	} else {
		data['show_self'] = false;
	}

	Tasks.addTask(function() {
		usersColl.find({
			username: sess['logged_in_as']
		}, {}, function(err, users) {
			data['firstname'] = users[0].firstname;
			Tasks.runNext();
		});
	})

	// Check if targetUser exists
	Tasks.addTask(function(self) {
		usersColl.find({
			username: targetUser
		}, {}, function(err, users) {
			if (err) {
				result['success'] = 0;
				result['err_type'] = 'mongodb_error';
				result['err_msg'] = "Unknown Error Occured.";
				res.render('profile', result);
			} else if (users.length <= 0) {
				result['success'] = 0;
				result['err_type'] = 'user_no_exists';
				result['err_msg'] = "User not found!";
				res.render('profile', result);
			} else {
				// User exists, store the object
				data['tg_firstname'] = users[0].firstname;
				data['tg_surname'] = users[0].surname;
				data['tg_reputation'] = users[0].reputation;
				data['tg_country'] = users[0].country;
				targetUserObj = users[0];
				self.runNext();
			}
		});
	});

	// Find all interests of this user
	Tasks.addTask(function(self) {
		interestsColl.find({
			int_id: {
				$in: targetUserObj.interests
			}
		}, "int_name", function(err, interests) {
			if (err) {
				result['success'] = 0;
				result['err_type'] = 'mongodb_error';
				result['err_msg'] = "Unknown Error Occured.";
				res.render('profile', result);
			} else if (interests.length <= 0) {
				result['success'] = 0;
				result['err_type'] = 'no_matched_interests';
				res.render('profile', result);
			} else {
				data['tg_interest'] = interests;
				console.log(data['tg_interest']);
				self.runNext();
			}
		});
	});

	// Find all projects by this user
	Tasks.addTask(function(self) {
		projectsColl.find({
			owner_username: targetUser
		}, {}, function(err, projects) {
			// console.log(projects);
			data['project'] = projects;
			// data['project'] = ["Hello", "GOODBYE"];
			self.runNext();
		});
	});

	// All the countries
	Tasks.addTask(function(self) {
		if (!data['show_self']) {
			self.runNext();
			return;
		}

		data['country'] = [];
		countriesColl.find({}, {}, function(err, countries) {
			for (var i = 0; i < countries.length; i++) {
				data['country'].push({
					name: countries[i].name
				});
			}
			// console.log(data['country']);
			Tasks.runNext();
		});
	});

	// Render
	Tasks.addTask(function(self) {
		res.render('profile', data);
	});

	Tasks.runNext();

});

module.exports = router;