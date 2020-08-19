/* Magic Mirror
 * Module: MMM-HomeAutomationNotifications
 * 
 * By Brian Johnson
 * MIT Licensed
 */

Module.register("MMM-HomeAutomationNotifications", {

	requiresVersion: "2.12.0",

	notifications: [],

	defaults: {
		max: 5,
		duration: 30,
		animationSpeed: 2500,
		types: {
			INFO: "dimmed",
			WARNING: "normal",
			ERROR: "bright"
		},
		icons: {
			INFO: "info",
			WARNING: "exclamation",
			ERROR: "exclamation-triangle"
		}
	},

	getScripts: function() {
		return ["moment.js"];
	},

	getStyles: function() {
		return ["font-awesome.css"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		this.sendSocketNotification("CONNECT");

		var self = this;
		setInterval(function() {
			self.updateDom();
		}, 60000);
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;

		if (notification === "HOME_AUTOMATION_NOTIFICATION") {
			var timestamp = moment();
			var duration = moment.duration(this.config.duration, "m");
			self.notifications.push({
				type: payload.type,
				message: payload.message,
				timestamp: timestamp.toISOString(),
				expiration: timestamp.add(duration).toISOString()
			});		

			while (self.notifications.length > self.config.max) {
				self.notifications.shift();
			}

			self.updateDom(self.config.animationSpeed);
		}
	},

	getDom: function() {
		var wrapper = document.createElement("div");

		var table = document.createElement("table");

		for (var i = this.notifications.length - 1; i >= 0; i--) {
			if (moment().isAfter(this.notifications[i].expiration)) {
				this.notifications.splice(i, 1);
				continue;
			}

			var row = document.createElement("tr");
			row.classList.add("normal");

			var iconCell = document.createElement("td");
			iconCell.classList.add("small");

			var icon = document.createElement("i");
			if (this.config.icons.hasOwnProperty(this.notifications[i].type)) {
				icon.classList.add("fa", "fa-fw", "fa-" + this.config.icons[this.notifications[i].type]);
			} else {
				icon.classList.add("fa", "fa-fw", "fa-question");
			}
			if (this.config.types.hasOwnProperty(this.notifications[i].type)) {
				icon.classList.add(this.config.types[this.notifications[i].type]);
			}

			iconCell.appendChild(icon);

			row.appendChild(iconCell);

			var caller =  document.createElement("td");
			caller.innerHTML = " " + this.notifications[i].message;
			caller.classList.add("title", "small", "align-left");
			if (this.config.types.hasOwnProperty(this.notifications[i].type)){
				caller.classList.add(this.config.types[this.notifications[i].type]);
			}
			row.appendChild(caller);

			var time = document.createElement("td");
			time.innerHTML = moment(this.notifications[i].timestamp).fromNow();
			time.classList.add("time", "light", "xsmall", "align-right");
			row.appendChild(time);

			table.appendChild(row);
		}

		wrapper.appendChild(table);

		return wrapper;
	}

});
