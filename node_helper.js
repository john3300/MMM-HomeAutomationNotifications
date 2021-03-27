/* Magic Mirror
 * Node Helper: MMM-HomeAutomationNotifications
 *
 * By Brian Johnson
 * MIT Licensed
 */

const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
	idPromise: null,

	socketNotificationReceived: function(notification, payload) {
		var self = this;

		self.sendSocketNotification("CONNECTED");

		if (notification === "HOME_AUTOMATION_NOTIFICATION_ID") {
			self.idPromise(payload);
		}
	},

	start: function() {
		var self = this;

		var types = ["INFO", "WARNING", "ERROR"];
		self.expressApp.post("/MMM-HomeAutomationNotifications", (req, res) => {
			if (!req.query.type) {
				res.status(400).json({ error: "Query parameter type is required!" });
			} else if (!types.includes(req.query.type)) {
				res.status(400).json({ error: "Query parameter type value is invalid!" });
			} else if (!req.query.message) {
				res.status(400).json({ error: "Query parameter message is required!" });
			} else {
				new Promise((resolve, reject) => {
					self.idPromise = resolve;
					self.sendSocketNotification("HOME_AUTOMATION_NOTIFICATION", {
						type: req.query.type,
						message: req.query.message
					});
				}).then((id) => {
					res.status(201).json({ id: id });
				});
			}
		});

		self.expressApp.put("/MMM-HomeAutomationNotifications", (req, res) => {
			if (!req.query.id) {
				res.status(400).json({ error: "Query parameter id is required!" });
			} else if (!req.query.type) {
				res.status(400).json({ error: "Query parameter type is required!" });
			} else if (!types.includes(req.query.type)) {
				res.status(400).json({ error: "Query parameter type value is invalid!" });
			} else if (!req.query.message) {
				res.status(400).json({ error: "Query parameter message is required!" });
			} else {
				self.sendSocketNotification("HOME_AUTOMATION_NOTIFICATION_UPDATE", {
					id: req.query.id,
					type: req.query.type,
					message: req.query.message
				});
				res.status(204).end();
			}
		});

		self.expressApp.delete("/MMM-HomeAutomationNotifications", (req, res) => {
			if (!req.query.id) {
				res.status(400).json({ error: "Query parameter id is required!" });
			} else {
				self.sendSocketNotification("HOME_AUTOMATION_NOTIFICATION_DELETE", {
					id: req.query.id
				});
				res.status(204).end();
			}
		});
	}
});
