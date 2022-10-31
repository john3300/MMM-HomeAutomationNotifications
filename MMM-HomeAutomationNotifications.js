/* Magic Mirror
 * Module: MMM-HomeAutomationNotifications
 * 
 * By Brian Johnson
 * MIT Licensed
 */

Module.register("MMM-HomeAutomationNotifications", {

	requiresVersion: "2.12.0",

	notifications: [],
	id: 1,

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
		var timestamp = moment();
		var duration = this.config.duration === -1 ? moment.duration(100, "y") : moment.duration(this.config.duration, "m");

		if (notification === "HOME_AUTOMATION_NOTIFICATION") {
			var id = self.generateId();

			console.log(timestamp.add(duration).toISOString())
			self.notifications.push({
				id: id,
				type: payload.type,
				message: payload.message,
				timestamp: timestamp.toISOString(),
				expiration: timestamp.add(duration).toISOString()
			});		
	
			while (self.notifications.length > self.config.max) {
				self.notifications.shift();
			}

			self.sendSocketNotification("HOME_AUTOMATION_NOTIFICATION_ID", id);
		} else if (notification === "HOME_AUTOMATION_NOTIFICATION_UPDATE") {
			var i = self.notifications.findIndex(x => x.id === payload.id);
			self.notifications[i] = {
				id: payload.id,
				type: payload.type,
				message: payload.message,
				timestamp: timestamp.toISOString(),
				expiration: timestamp.add(duration).toISOString()
			};
		} else if (notification === "HOME_AUTOMATION_NOTIFICATION_DELETE") {
			for (i = self.notifications.length - 1; i >= 0; i--) {
				if (self.notifications[i].id == payload.id) {
					self.notifications.splice(i, 1);
				}
			}
		}

		self.updateDom(self.config.animationSpeed);
	},

	generateId: function() {
		var self = this;

		var id = self.id++;
		if (self.id > 100) {
			self.id = 1;
		}

		return id;
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
