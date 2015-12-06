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

	var projectID = req.query['id'];
	var ownerUsername = null;
	var p_int_id = null;

	// Get the firstname of logged in user
	if (sess['logged_in_as']) {
		data['login'] = false;
		tm.addTask(function() {
			usersColl.find({
				username: sess['logged_in_as']
			}, "firstname", function(err, users) {
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
					tm.runNext();
				}
			})
		});
	} else {
		data['login'] = true;
	}

	if (projectID) {

		// Get the project infos
		tm.addTask(function() {
			projectsColl.find({
				id: parseInt(projectID)
			}, {}, function(err, projects) {
				console.log(projects);
				if (projects.length <= 0) {
					res.render("project", data);
				} else {
					data['p_title'] = projects[0].title;
					data['p_goal'] = projects[0].funding_goal;
					data['p_reputation'] = projects[0].reputation;
					p_int_id = projects[0].categories;
					ownerUsername = projects[0].owner_username;
					tm.runNext();
				}
			});
		});

		// Get the names of interests
		tm.addTask(function() {
			interestsColl.find({
				int_id: {
					$in: p_int_id
				}
			}, "int_name", function(err, interests) {
				if (err) {
					result['success'] = 0;
					result['err_type'] = 'mongodb_error';
					result['err_msg'] = "Unknown Error Occured.";
					res.render('project', result);
				} else {
					data['p_interest'] = interests;
					tm.runNext();
				}
			});
		});

		// Get some owner information
		tm.addTask(function() {
			usersColl.find({
				username: ownerUsername
			}, {}, function(err, users) {
				if (err) {
					result['success'] = 0;
					result['err_type'] = 'mongodb_error';
					result['err_msg'] = "Unknown Error Occured.";
					res.render('project', result);
				} else {
					data['o_firstname'] = users[0].firstname;
					data['o_surname'] = users[0].surname;
					data['o_username'] = users[0].username;

					// Also check if the viewer is the owner
					data['show_owner'] = (ownerUsername == sess['logged_in_as']);

					tm.runNext();
				}
			});
		});

		// All the interests
		tm.addTask(function() {
			if (!data['show_owner']) {
				tm.runNext();
				return;
			}

			var p_interests = [];
			for (var i = 0; i < data['p_interest'].length; i++) {
				p_interests.push(data['p_interest'][i].int_name);
			}

			data['interest'] = [];
			interestsColl.find({}, {}, function(err, interests) {
				for (var i = 0; i < interests.length; i++) {
					var checked = "";
					if (p_interests.indexOf(interests[i].int_name) != -1) {
						checked = "checked";
					}
					data['interest'].push({
						id: interests[i].int_id,
						name: interests[i].int_name,
						checked: checked
					});
				}
				// console.log(data['country']);
				console.log(data['interest']);
				tm.runNext();
			});
		})

		// Render
		tm.addTask(function() {
			res.render("project", data);
		});

		tm.runNext();

	} else {
		tm.runNext();
		res.render("project", data);
	}

});

module.exports = router;