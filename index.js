
var Anodia;
var five = require("johnny-five");
var SerialPort = require("serialport").SerialPort;

var Communication_Arduino = {

	arduino: null,

	init: function(anodia,callback) {

		Anodia = anodia;
		this.arduino = new five.Board({repl:false,debug:false});

		this.arduino.on("error", function(msg) {
			Anodia.log(1,msg);
		});

		this.arduino.on("connect", function() {
			Anodia.log(2,"Arduino is connected");
		})

		this.arduino.on("ready", function() {

			this.arduino.sensor = new five.Sensor({ pin: "A0", freq: 1000});

			Anodia.log(2,"Arduino is ready");
			callback(null);
		}.bind(this));
	},

	run: function() {

	},

	command: function(args) {
		var pin = args.shift();
		var action = args.shift();

		if (pin == "A0") {
			if (action == "value") {
				console.log(this.temperature(this.arduino.sensor.raw));
			} else {
				console.log("Unknown action: "+action);
			}
		} else {
			console.log("Unknown pin: "+pin);
		}
	},

	temperature: function(temp) {

		var thermistornominal = 100000;
		var temperaturenominal = 25;
		var bcoefficient = 3950;
		var seriesresistor = 68500;

		temp = seriesresistor / (1023 / temp - 1);

		return (1.0 / ((Math.log(temp / thermistornominal) / bcoefficient) + (1.0/(temperaturenominal + 273.15)))) - 273.15 ;
	}
};

module.exports = Communication_Arduino;