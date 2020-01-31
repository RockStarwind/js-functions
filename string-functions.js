/*
 ─────────────────────────────────────────────────────────────────────────────
 Author: @RockStarwind
 Date: 2020-01-31
 Repo: https://github.com/RockStarwind/js-functions
 License: MIT
 ─────────────────────────────────────────────────────────────────────────────
*/

/*
 # isLowerCase()
 How to use:
   "string".isLowerCase();
   If result is true: All alphabetical characters in the string are in lowercase.
   If result is false: All alphabetical characters in the string aren't in lowercase.
   If result is null: There are no alphabetical characters in the string.
*/
String.prototype.isLowerCase = function() {
	'use strict';
	if ((/([a-zA-Z\u00BF-\u1FFF\u2C00-\uD7FF])/i).test(this)) {
		return this === this.toLowerCase()
	} else {
		return null
	}
}

/*
 # isUpperCase()
 How to use:
   "string".isUpperCase();
   If result is true: All alphabetical characters in the string are in uppercase.
   If result is false: All alphabetical characters in the string aren't in uppercase.
   If result is null: There are no alphabetical characters in the string.
*/
String.prototype.isUpperCase = function() {
	'use strict';
	if ((/([a-zA-Z\u00BF-\u1FFF\u2C00-\uD7FF])/i).test(this)) {
		return this === this.toUpperCase()
	} else {
		return null
	}
}

/*
 # toAltCase()
 How to use:
   "string".toAltCase(lowercase);
   * lowercase options:
      * true: Start altcasing with lowercase letters
      * false: Start altcasing with uppercase letters
      * (blank): First alphabetical character decides altcasing
*/
String.prototype.toAltCase = function(lowercase) {
	'use strict';
	if (typeof(lowercase) !== "undefined") {
		lowercase = (["true", true].includes(lowercase));
	}
	var str = this.split("");
	for (var i = 0; i < str.length; i++) {
		if ((/[a-z]/i).test(str[i])) {
			if (typeof(lowercase) === "undefined") {
				lowercase = (str[i]).isLowerCase();
			}
			str[i] = (lowercase) ? str[i].toLowerCase() : str[i].toUpperCase()
			lowercase = !lowercase;
		}
	}
	return str.join("");
}
