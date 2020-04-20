/*
 ─────────────────────────────────────────────────────────────────────────────
 Author: @RockStarwind
 Creation Date: 2020-04-16
 v1.01 Date: 2020-04-19
 v1.04 Date: 2020-04-20
 v1.05 Date: 2020-04-20
 Stylesheets code borrowed from @tomhodgins' CSSOMTools
 Repo: https://github.com/RockStarwind/js-functions
 License: MIT
 ─────────────────────────────────────────────────────────────────────────────
*/

// A group of helpers that can be reused
const pseudosFuncs = {
	_elements: [
		{name: "Div", extends: "div"},
		{name: "Span", extends: "span"},
		{name: "UList", extends: "ul"},
		{name: "OList", extends: "ol"},
		{name: "DList", extends: "dl"},
		{name: "LI", extends: "li"},
		{name: "Label", extends: "label"},
		{name: "", extends: "dd"},
		{name: "", extends: "dt"},
	],
	
	// ● Get and Set pseudo attribute
	getPseudos: function (el) {
		var pseudos = Number(el.getAttribute("pseudos")) || 1;
		pseudos = (pseudos > 0) ? pseudos : 1;
		return pseudos;
	},
	setPseudos: function (val, el) {
		val = Number(val) || 1;
		val = (val > 0) ? val : 1;
		el.setAttribute("pseudos", Number(val) || 1);
		el.rerender(el.innerHTML, val);
	},
	
	// ● Get and Set pseudo names
	getPseudosNames: function (el) {
		var pseudosNames = el.getAttribute("pseudos-names") || false;
		return pseudosNames;
	},
	setPseudosNames: function (val, el) {
		if (val) {
			el.setAttribute("pseudos-names", val);
		} else {
			el.removeAttribute("pseudos-names");
		}
		el.rerender(el.innerHTML, el.pseudos)
	},
	
	// ● Initialize extending elements with pseudo functionality 
	init: function (el) {
		// ■ Function: Quickly retrieve property value of element
		function gpv(property, elem) {
			elem = elem || el;
			return window.getComputedStyle(elem).getPropertyValue(property);
		}
		
		// ■ Function: Pre-rerender
		function prererender() {
			pseudos = el.pseudos;
			pseudosNames = el.pseudosNames;
			content = el.innerHTML;
		}
		
		// ■ Create Shadow Root, declare variables
		var shadow = el.attachShadow({mode: 'open'});
		var content = el.innerHTML;
		var pseudos = el.pseudos;
		var pseudosNames = el.pseudosNames;
		var contentProp = {};
		var self = el;
		el.render(content, pseudos);
		
		// ■ Update shadow if...
		setInterval(function () {
			// If pseudo names, count, or --keyframes property aren't the same, rerender.
			if (
				pseudos !== el.pseudos ||
				pseudosNames !== el.pseudosNames
			) {
				contentProp = {};
				prererender();
				el.rerender(content, pseudos);
			}
			
			// Loop through pseudos
			for (var i = 0; i < pseudos; i++) {
				// Select shadowpseudo element and get property value of content;
				var spanBeforePart = `[part*="nth-before-${(i + 1)}"]`;
				var spanBefore = shadow.querySelector(spanBeforePart);
				var spanBeforeContent = gpv("content", spanBefore);
				var spanAfterPart = `[part*="nth-after-${(i + 1)}"]`;
				var spanAfter = shadow.querySelector(spanAfterPart);
				var spanAfterContent = gpv("content", spanAfter);
				
				// Assign content values to contentProp object
				if (Object.keys(contentProp).length < (pseudos * 2)) {
					contentProp[spanBeforePart] = spanBeforeContent;
					contentProp[spanAfterPart] = spanAfterContent;
				}
				// Check if contentProp object values matches content property values
				else {
					if (
						contentProp[spanBeforePart] !== spanBeforeContent ||
						contentProp[spanAfterPart] !== spanAfterContent
					) {
						contentProp[spanBeforePart] = spanBeforeContent;
						contentProp[spanAfterPart] = spanAfterContent;
						prererender();
						el.rerender(content, pseudos);
						break;
					}
				}
			}
		}, 500);
	},
	
	// ● Re-render the contents
	rerender: function (content, pseudos, el) {
		content = content || el.innerHTML;
		pseudos = Number(pseudos) || el.pseudos || 1;
		var shadow = el.shadowRoot;
		shadow.innerHTML = "";
		el.render(content, pseudos);
	},
	
	// ● Render the contents
	render: function (content, pseudos, el) {
		// ■ Function: Quickly retrieve property value of element
		function gpv(property, elem) {
			elem = elem || el;
			return window.getComputedStyle(elem).getPropertyValue(property);
		}
		
		// ■ Declare variables
		content = content || el.innerHTML;
		pseudos = Number(pseudos) || el.pseudos || 1;
		var pseudosNames = el.pseudosNames || "";
		
		// ■ Modify content of pseudosNames
		if (pseudosNames) {
			// Split pseudosNames by whitespace
			pseudosNames = pseudosNames.split(" "); 
			// Loop through pseudosNames array, check for a match. pseudosName must begin with a letter (A-Z), rest of the name must comprise of letters (A-Z), numbers, hyphens, and underscores
			for (var i = 0; i < pseudosNames.length; i) {
				if ((/^(([a-zA-Z]){1}([a-zA-Z0-9-_]*))$/i).test(pseudosNames[i])) {
					i++; // Proceed
				} else {
					console.warn(`${pseudosNames[i]} is not a valid name. Names must begin with a letter and only contain letters, numbers, hyphens, and underscores.`);
					pseudosNames.splice(i, 1); // Remove from array
				}
			}
		}
		
		// ■ Create shadow and style
		var shadow = el.shadowRoot;
		var style = document.createElement("style");
		style.innerHTML = `
			/* .shadowpseudo content */
			:host .shadowpseudo > span:before { content: normal; }
			:host .shadowpseudo > span:after { content: none; }
		`;
		
		// ■ Retrieve available stylesheets
		// * Uses code from @tomhodgins' CSSOMTools
		var stylesheets = (function () {
			return Array.prototype.slice.call(document.styleSheets).map(function(stylesheet) {
				try { stylesheet.cssRules; }
				catch(error) { return null; }
				return stylesheet;
			}).filter(
				function (object) {
					return object && object.cssRules && object.cssRules.length;
				}
			)
		})();
		
		// ■ Loop through available stylesheets
		for (var i = 0; i < stylesheets.length; i++) {
			var rules = stylesheets[i].rules;
			// Loop through stylesheet rules
			for (var j = 0; j < rules.length; j++) {
				// Is this a keyframes rule?
				if (rules[j].type === 7) {
					style.innerHTML += rules[j].cssText;
				}
			}
		}
		
		// ■ Create innerHTML slot and before/after templates
		var slot = document.createElement("slot");
		slot.innerHTML = el.innerHTML;
		var templateBefore = document.createElement("template");
		var templateAfter = document.createElement("template");
		
		// ■ Create and append befores and afters to templates
		for (var i = 0; i < pseudos; i++) {
			// Create an array of part names for each generated shadow pseudo
			var beforeNames = ["before", `nth-before-${(i + 1)}`, `nth-last-before-${(pseudos - i)}`, "pseudo", `nth-pseudo-${(i + 1)}`, `nth-last-pseudo-${(pseudos - i)}`];
			var afterNames = ["after", `nth-after-${(i + 1)}`, `nth-last-after-${(pseudos - i)}`, "pseudo", `nth-pseudo-${(i + 1)}`, `nth-last-pseudo-${(pseudos - i)}`];
			
			// Attach more names
			if ((i === pseudos - 1) && (i === 0)) { // Only
				beforeNames.push(...["only-before", "only-pseudo"]);
				afterNames.push(...["only-after", "only-pseudo"]);
			}
			if (i === 0) { // First
				beforeNames.push(...["first-before", "first-pseudo"]);
				afterNames.push(...["first-after", "first-pseudo"]);
			}
			if (i === pseudos - 1) { // Last
				beforeNames.push(...["last-before", "last-pseudo"]);
				afterNames.push(...["last-after", "last-pseudo"]);
			}
			if (pseudosNames && pseudosNames[i]) { // Named pseudo
				beforeNames.push(...[`named-before-${pseudosNames[i]}`, `named-pseudo-${pseudosNames[i]}`]);
				afterNames.push(...[`named-after-${pseudosNames[i]}`, `named-pseudo-${pseudosNames[i]}`]);
			}
			
			// Create before/after shadow pseudos
			// before
			var spanBefore = document.createElement("span");
			spanBefore.setAttribute("part", beforeNames.join(" "));
			spanBefore.setAttribute("class", "shadowpseudo");
			spanBefore.appendChild(document.createElement("span"));
			templateBefore.content.appendChild(spanBefore);
			// after
			var spanAfter = document.createElement("span");
			spanAfter.setAttribute("part", afterNames.join(" "));
			spanAfter.setAttribute("class", "shadowpseudo");
			spanAfter.appendChild(document.createElement("span"));
			templateAfter.content.appendChild(spanAfter);
		}
		
		// ■ Attach elements to shadow
		shadow.appendChild(style);
		shadow.appendChild(templateBefore.content);
		shadow.appendChild(slot);
		shadow.appendChild(templateAfter.content);
		
		// ■ Loop through number of pseudos and add content
		for (var i = 0; i < pseudos; i++) {
			var spanBeforePart = `[part*="nth-before-${(i + 1)}"]`;
			var spanBefore = shadow.querySelector(spanBeforePart);
			var spanBeforeContent = gpv("content", spanBefore);
			var spanAfterPart = `[part*="nth-after-${(i + 1)}"]`;
			var spanAfter = shadow.querySelector(spanAfterPart);
			var spanAfterContent = gpv("content", spanAfter);
			style.innerHTML += `
				:host ${spanBeforePart} > span:before { content: ${spanBeforeContent}; }
				:host ${spanAfterPart} > span:before { content: ${spanAfterContent}; }
			`;
		}
	}
}

// Loop through pseudosFuncs._elements and extend several elements
for (var i = 0; i < pseudosFuncs._elements.length; i++) {
	var item = pseudosFuncs._elements[i];
	customElements.define(
		`pseudos-${item.extends}`,
		class extends eval(`HTML${item.name}Element`) {
			get pseudos() { return pseudosFuncs.getPseudos(this); }
			set pseudos(val) { return pseudosFuncs.setPseudos(val, this); }
			get pseudosNames() { return pseudosFuncs.getPseudosNames(this); }
			set pseudosNames(val) { return pseudosFuncs.setPseudosNames(val, this); }
			constructor() { super(); pseudosFuncs.init(this); }
			rerender(content, pseudos) { pseudosFuncs.rerender(content, pseudos, this); }
			render(content, pseudos) { pseudosFuncs.render(content, pseudos, this); }
		},
		{ extends: item.extends }
	);
}
