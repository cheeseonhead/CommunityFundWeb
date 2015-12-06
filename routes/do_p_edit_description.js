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
	var projectsColl = req.db.get('projects');
	var result = {
		success: 0
	}

	// Not logged in do nothing
	if (!sess['logged_in_as'])
		res.end();

	var description = req.body['new_description'];

	var curProObj = null;

	// Get the project object
	tasks.addTask(function() {
		projectsColl.find({
			id: parseInt(req.body['id'])
		}, {}, function(err, projects) {
			console.log(projects);
			curProObj = projects[0];
			tasks.runNext();
		})
	});

	// Edit the info
	tasks.addTask(function() {
		// Check if the owne is logged in
		if (sess['logged_in_as'] == curProObj.owner_username) {

			curProObj['description'] = description;

			projectsColl.update({
				id: curProObj.id
			}, curProObj);

			result['success'] = 1;
			result['project'] = curProObj;

			res.send(result);
		} else {
			res.send(result)
		}
	});

	tasks.runNext();
});

module.exports = router;