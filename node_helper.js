/* Magic Mirror
 * Node Helper: MMM-HomeAutomationNotifications
 *
 * By Brian Johnson
 * MIT Licensed
 */

const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	socketNotificationReceived: function(notification, payload) {
		this.sendSocketNotification("CONNECTED");
	},

	start: function() {
		var self = this;

		var types = ["INFO", "WARNING", "ERROR"];
		self.expressApp.post('/MMM-HomeAutomationNotifications', function (req, res) {
			if (!req.query.type) {
				res.status(400).send("Query parameter type is required!");
			} else if (!types.includes(req.query.type)) {
				res.status(400).send("Query parameter type value is invalid!");
			} else if (!req.query.message) {
				res.status(400).send("Query parameter message is required!");
			} else {
				self.sendSocketNotification("HOME_AUTOMATION_NOTIFICATION", {
					type: req.query.type,
					message: req.query.message
				});

				res.status(204).end();
			}
		});
	}
});
