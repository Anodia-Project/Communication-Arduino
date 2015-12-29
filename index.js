
var Anodia;
var five = require("johnny-five");
var SerialPort = require("serialport").SerialPort;

var Communication_Arduino = {

	arduino: null,

	init: function(anodia) {

		Anodia = anodia;
		this.arduino = new five.Board({repl:false,debug:false});

		this.arduino.on("error", function(msg) {
			Anodia.log(1,msg);
		});

		this.arduino.on("ready", function() {
			Anodia.log(0,"Arduino is ready");
		});
	},

	run: function() {

	}
};

module.exports = Communication_Arduino;