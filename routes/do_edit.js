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

	sess = req.session;
	var tasks = new TasksClass();
	var usersColl = req.db.get('users');
	var result = {
		success: 0
	}

	// Not logged in do nothing
	if (!sess['logged_in_as'])
		res.end();

	var firstname = req.body['new_firstname'];
	var surname = req.body['new_surname'];
	var country = req.body['new_country'];

	var curUserObj = null

	// Get the user object
	tasks.addTask(function() {
		usersColl.find({
			username: sess['logged_in_as']
		}, {}, function(err, users) {
			curUserObj = users[0];
			tasks.runNext();
		})
	});

	// Edit the info
	tasks.addTask(function() {
		curUserObj['firstname'] = firstname;
		curUserObj['surname'] = surname;
		curUserObj['country'] = country;

		usersColl.update({
			username: sess['logged_in_as']
		}, curUserObj);

		result['success'] = 1;
		result['user'] = curUserObj;

		res.send(result);
	});

	tasks.runNext();
});

module.exports = router;