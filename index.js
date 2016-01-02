
var Anodia;
var five = require("johnny-five");
var SerialPort = require("serialport").SerialPort;
var fs = require("fs");

var Communication_Arduino = {

	arduino: null,
	map : null,

	init: function(anodia,callback) {

		Anodia = anodia;
		this.arduino = new five.Board({repl:false,debug:false});

		this.arduino.sensors = [];
		this.arduino.relays = [];

		this.arduino.get = function(pin) {

			if (this.sensors[pin]) {
				return this.sensors[pin];
			} else if (this.relays[pin]) {
				return this.relays[pin];
			}

			return null;
		};

		this.arduino.on("error", function(msg) {
			Anodia.log(1,msg);
		});

		this.arduino.on("connect", function() {
			Anodia.log(2,"Arduino is connected");
		})

		this.arduino.on("ready", function() {

			Anodia.log(2,"Arduino is ready");

			this.load_map(callback);
		}.bind(this));
	},

	run: function() {

	},

	load_map: function(callback) {
		Anodia.log(2,"loading_map");

		this.map = JSON.parse(fs.readFileSync("./config/map.json"));

		for(var key in this.map.sensors) {
			sensor = this.map.sensors[key];
			this.arduino.sensors[sensor.pin] = this.activate_sensor(sensor);
		}

		for(var key in this.map.relays) {
			relay = this.map.relays[key];
			this.arduino.relays[relay.pin] = this.activate_relay(relay);
		}

		callback(null);
	},

	activate_sensor: function(sensor) {

		var sensor = new five.Sensor({ pin: sensor.pin, freq: sensor.freq, type: sensor.type || "analog"});

		sensor._value = function() {
			return this.raw;
		};

		sensor._set = function() {
			return "You cannot set a value to a sensor";
		};

		Anodia.log(2,"new sensor pin: "+sensor.pin);

		return sensor;
	},

	activate_relay: function(relay) {
		var relay = new five.Relay({ pin: relay.pin, type: relay.type });

		relay._value = function() {
			return this.isOn; // Why '!' ? I dunno, but it works 
		};

		relay._set = function(value) {
			if (value == "true" || value == "1") {
				this.close();
				return true;
			} else if (value == "false" || value == "0") {
				this.open();
				return false;
			} else {
				return "Value must be 'true' or 'false'";
			}
		};

		relay._reset = function() {
			this._set(this.type == "NC" ? "true" : "false");
		};

		Anodia.log(2,"new relay pin: "+relay.pin);

		return relay;
	},

	command: function(args) {
		var pin = args.shift();
		var action = args.shift();

		if (this.arduino.get(pin)) {
			pin = this.arduino.get(pin);

			if (pin["_"+action]) {
			//if (action == "value") {
				var ret = pin["_"+action](args);
				if (ret != undefined)
					console.log(ret);
			} else {
				console.log("Unknown action: "+action);
			}
		} else {
			console.log("Unknown pin: "+pin);
		}
	},
	exit: function(cb) {
		for(var key in this.arduino.relays) {
			this.arduino.relays[key]._set("false");
		}

		setTimeout(function() {
			// To be sure everything on serial port has been transmitted
			cb(null);
		},50);
	}/*,

	temperature: function(temp) {

		var thermistornominal = 100000;
		var temperaturenominal = 25;
		var bcoefficient = 3950;
		var seriesresistor = 68500;

		temp = seriesresistor / (1023 / temp - 1);

		return (1.0 / ((Math.log(temp / thermistornominal) / bcoefficient) + (1.0/(temperaturenominal + 273.15)))) - 273.15 ;
	}*/
};

module.exports = Communication_Arduino;