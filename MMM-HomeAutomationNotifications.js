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
		coloredSymbol: false,
		coloredText: false,
		infoColor: "#666",
		warningColor: "#999",
		errorColor: "#fff",
		types: {
			INFO: "dimmed",
			WARNING: "normal",
			ERROR: "bright"
		},
		symbols: {
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
		var duration = moment.duration(this.config.duration, "m");

		if (notification === "HOME_AUTOMATION_NOTIFICATION") {
			var id = self.generateId();

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
			for (var j = self.notifications.length - 1; j >= 0; j--) {
				if (self.notifications[j].id == payload.id) {
					self.notifications.splice(j, 1);
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

			var symbolCell = document.createElement("td");
			symbolCell.classList.add("small");

			var symbol = document.createElement("i");
			if (this.config.symbols.hasOwnProperty(this.notifications[i].type)) {
				symbol.classList.add("fa", "fa-fw", "fa-" + this.config.symbols[this.notifications[i].type]);
			} else {
				symbol.classList.add("fa", "fa-fw", "fa-question");
			}
			if (this.config.types.hasOwnProperty(this.notifications[i].type)) {
				symbol.classList.add(this.config.types[this.notifications[i].type]);
			}
			if (this.config.coloredSymbol) {
				symbol.style.cssText = "color:" + this.getTypeColor(this.notifications[i].type);
			}

			symbolCell.appendChild(symbol);

			row.appendChild(symbolCell);

			var caller =  document.createElement("td");
			caller.innerHTML = " " + this.notifications[i].message;
			caller.classList.add("title", "small", "align-left");
			if (this.config.types.hasOwnProperty(this.notifications[i].type)){
				caller.classList.add(this.config.types[this.notifications[i].type]);
			}
			if (this.config.coloredText) {
				caller.style.cssText = "color:" + this.getTypeColor(this.notifications[i].type);
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
	},

	getTypeColor: function(type) {
		var color;

		switch (type) {
			case "INFO":
				color = this.config.infoColor;
				break;
			case "WARNING":
				color = this.config.warningColor;
				break;
			case "ERROR":
				color = this.config.errorColor;
		}

		return color;
	}
});
