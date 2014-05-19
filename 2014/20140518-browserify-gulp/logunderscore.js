'use strict';

var _ = require('underscore');

var logUnderscoreVersion = function() {
	console.log(_.VERSION);
	document.write("<h1>Underscore " + _.VERSION + "</h1>");
}

module.exports = logUnderscoreVersion;
