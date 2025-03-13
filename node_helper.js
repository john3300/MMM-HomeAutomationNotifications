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
    self.expressApp.use(
      "/MMM-HomeAutomationNotifications",
      (req, res, next) => {
        var data = "";
        req.on("data", function (chunk) {
          data += chunk;
        });
        req.on("end", function () {
          req.rawBody = data;
          try {
            req.jsonBody = JSON.parse(data);
          } catch {
            // Content wasn't JSON Content
          }
          next();
        });
      }
    );
    self.expressApp.post("/MMM-HomeAutomationNotifications", (req, res) => {
      const type = req.jsonBody ? req.jsonBody.type : req.query.type;
      const message = req.jsonBody ? req.jsonBody.message : req.query.message;
			const id = req.jsonBody ? req.jsonBody.id : req.query.id;
      if (!type) {
        res.status(400).json({ error: "Query parameter type is required!" });
      } else if (!types.includes(type)) {
        res
          .status(400)
          .json({ error: "Query parameter type value is invalid!" });
      } else if (!message) {
        res.status(400).json({ error: "Query parameter message is required!" });
      } else {
        new Promise((resolve, reject) => {
          self.idPromise = resolve;
          self.sendSocketNotification("HOME_AUTOMATION_NOTIFICATION", {
            type: type,
            message: message,
						id: id
          });
        }).then((id) => {
          res.status(201).json({ id: id });
        });
      }
    });

    self.expressApp.put("/MMM-HomeAutomationNotifications", (req, res) => {
			const id = req.jsonBody ? req.jsonBody.id : req.query.id
			const type = req.jsonBody ? req.jsonBody.type : req.query.type
			const message = req.jsonBody ? req.jsonBody.message : req.query.message
      if (!id) {
        res.status(400).json({ error: "Query parameter id is required!" });
      } else if (!type) {
        res.status(400).json({ error: "Query parameter type is required!" });
      } else if (!types.includes(type)) {
        res
          .status(400)
          .json({ error: "Query parameter type value is invalid!" });
      } else if (!message) {
        res.status(400).json({ error: "Query parameter message is required!" });
      } else {
        self.sendSocketNotification("HOME_AUTOMATION_NOTIFICATION_UPDATE", {
          id: id,
          type: type,
          message: message
        });
        res.status(204).end();
      }
    });

    self.expressApp.delete("/MMM-HomeAutomationNotifications", (req, res) => {
			const id = req.jsonBody ? req.jsonBody.id : req.query.id
      if (!id) {
        res.status(400).json({ error: "Query parameter id is required!" });
      } else {
        self.sendSocketNotification("HOME_AUTOMATION_NOTIFICATION_DELETE", {
          id: id
        });
        res.status(204).end();
      }
    });
  }
});
