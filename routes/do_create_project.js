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
	var projectsColl = req.db.get('projects');
	var result = {
		success: 0
	}

	// Not logged in do nothing
	if (!sess['logged_in_as'])
		res.end();

	var title = req.body['new_title'];
	var goal = req.body['new_goal'];
	var desp = req.body['new_description'];
	var ownerUsername = sess['logged_in_as'];
	var pid = null;

	var intIdArray = [];
	for (var e in req.body) {
		if (!isNaN(e))
			intIdArray.push(parseInt(e));
	}

	var curProObj = null;

	tasks.addTask(function() {
		projectsColl.findOne({
			$query: {},
			$orderby: {
				_id: -1
			}
		}, "id", function(err, item) {
			// Find the next id
			pid = item.id + 1;

			curProObj = {
				id: pid,
				owner_username: ownerUsername,
				title: title,
				description: desp,
				funding_goal: goal,
				categories: intIdArray,
				reputation: 0
			};

			tasks.runNext();
		});
	});

	// Insert this project into the database
	tasks.addTask(function() {
		projectsColl.insert(curProObj, function(err, obj) {
			result['success'] = 1;
			result['project'] = obj;
			res.send(result);
		});
	});

	tasks.runNext();
});

module.exports = router;