/*
 ─────────────────────────────────────────────────────────────────────────────
 Author: @RockStarwind
 Date: 2020-01-31
 Repo: https://github.com/RockStarwind/js-functions
 License: MIT
 ─────────────────────────────────────────────────────────────────────────────
 How to use:
   "string".toAltCase(lowercase);
   * lowercase: false by default, set to true to start altcasing in lowercase
*/
String.prototype.toAltCase = function(lowercase) {
	'use strict';
	lowercase = (lowercase === true);
	var str = this.split("");
	for (var i = 0; i < str.length; i++) {
		if ((/([A-Za-z\u00C0-\u1FFF\u2800-\uFFFD])/i).test(str[i])) {
			str[i] = (lowercase) ? str[i].toLowerCase() : str[i].toUpperCase()
			lowercase = !lowercase;
		}
	}
	return str.join("");
}
