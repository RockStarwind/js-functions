/*
 ─────────────────────────────────────────────────────────────────────────────
 Author: @RockStarwind
 Creation Date: 2020-04-16
 v1.01 Date: 2020-04-19
 v1.04 Date: 2020-04-20
 v1.05 Date: 2020-04-20
 v1.06 Date: 2020-04-23
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
		if (val) { el.setAttribute("pseudos-names", val); }
		else { el.removeAttribute("pseudos-names"); }
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
			// If pseudo names or number of pseudos aren't the same
			if (pseudos !== el.pseudos || pseudosNames !== el.pseudosNames) {
				contentProp = {};
				prererender();
				el.rerender(content, pseudos);
			}
			
			// If pseudo content property values do not match
			// Loop through pseudos
			for (var i = 0; i < pseudos; i++) {
				// For loop is there to prevent writing repetitive code.
				// 0 represents "before"; 1 represents "after"
				for (var j = 0; j <= 1; j++) {
					// Select shadowpseudo element and get property value of content;
					var position = (j === 0) ? "before" : "after";
					var selector = `[part*="nth-${position}-${(i + 1)}"]`;
					var spanEl = shadow.querySelector(selector);
					var spanContent = gpv("content", spanEl);
					
					// Assign content values to contentProp object
					if (Object.keys(contentProp).length < (pseudos * 2)) {
						contentProp[selector] = spanContent;
					}
					else {
						// Check if contentProp key matches content property value
						if (contentProp[selector] !== spanContent) {
							contentProp[selector] = spanContent;
							prererender();
							el.rerender(content, pseudos);
							break;
						}
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
		var styleProps = {};
		
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
		
		// ■ Create shadow and other elements
		var shadow = el.shadowRoot;
		var slot = document.createElement("slot");
		var templateBefore = document.createElement("template");
		var templateAfter = document.createElement("template");
		var style = document.createElement("style");
		
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
					// Append the rule to the Shadow DOM stylesheet
					style.innerHTML += rules[j].cssText + "\n";
				}
			}
		}
		
		// ■ Slot and Style
		slot.innerHTML = el.innerHTML;
		style.innerHTML = [
			"/* .shadowpseudo content */",
			":host .shadowpseudo > span:before { content: normal; }",
			":host .shadowpseudo > span:after { content: none; }",
			":host .shadowpseudo:before { --shadowpseudo-pseudo: \"before\"; }",
			":host .shadowpseudo:after { --shadowpseudo-pseudo: \"after\"; }\n\n",
		].join("\n");
		
		// ■ Create and append befores and afters to templates
		for (var i = 0; i < pseudos; i++) {
			// Set Style Props
			styleProps.index = i + 1;
			styleProps.lastIndex = (pseudos - i);
			styleProps.name = "";
			styleProps.position = "";
			
			// For loop is there to prevent writing repetitive code.
			// 0 represents "before"; 1 represents "after"
			for (var j = 0; j <= 1; j++) {
				var position = (j === 0) ? "Before" : "After";
				var parts = ["pseudo", `nth-pseudo-${(i + 1)}`, `nth-last-pseudo-${(pseudos - i)}`];
				styleProps.position = position.toLowerCase();
				
				// Push before/after parts
				if (j === 0) { // Push "before" parts
					parts.push(...["before", `nth-before-${(i + 1)}`, `nth-last-before-${(pseudos - i)}`]);
				}
				else { // Push "after" parts
					parts.push(...["after", `nth-after-${(i + 1)}`, `nth-last-after-${(pseudos - i)}`]);
				}
				// Push more parts depending on index (only, first, last)
				if ((i === pseudos - 1) && (i === 0)) { // Only Pseudo
					parts.push(...["only-pseudo", `only-${position.toLowerCase()}`]);
				}
				if (i === 0) { // First Pseudo
					parts.push(...["first-pseudo", `first-${position.toLowerCase()}`]);
				}
				if (i === pseudos - 1) { // Last Pseudo
					parts.push(...["last-pseudo", `last-${position.toLowerCase()}`]);
				}
				// Push named pseudo parts / Assign value to styleProps.name
				if (pseudosNames && pseudosNames[i]) { // Named Pseudo
					parts.push(...[`named-pseudo-${pseudosNames[i]}`, `named-${position.toLowerCase()}-${pseudosNames[i]}`]);
					styleProps.name = pseudosNames[i];
				}
				
				// Create span elements
				var spanEl = document.createElement("span");
				spanEl.appendChild(document.createElement("span"));
				
				// Assign attributes
				spanEl.setAttribute("class", "shadowpseudo");
				spanEl.setAttribute("part", parts.join(" "));
				spanEl.style.setProperty("--shadowpseudo-index", styleProps.index);
				spanEl.style.setProperty("--shadowpseudo-last-index", styleProps.lastIndex);
				spanEl.style.setProperty("--shadowpseudo-name", `"${styleProps.name}"`);
				spanEl.style.setProperty("--shadowpseudo-position", `"${styleProps.position}"`);
				
				// Attach span to a template
				var templateEl = (j === 0) ? templateBefore : templateAfter;
				templateEl.content.appendChild(spanEl);
			}
		}
		
		// ■ Attach elements to shadow
		shadow.appendChild(style);
		shadow.appendChild(templateBefore.content);
		shadow.appendChild(slot);
		shadow.appendChild(templateAfter.content);
		
		// ■ Loop through number of pseudos and add content
		for (var i = 0; i < pseudos; i++) {
			// For loop is there to prevent writing repetitive code.
			// 0 represents "before"; 1 represents "after"
			for (var j = 0; j <= 1; j++) {
				var position = (j === 0) ? "before" : "after";
				var selector = `[part*="nth-${position}-${(i + 1)}"]`;
				var spanEl = shadow.querySelector(selector);
				var spanContent = gpv("content", spanEl);
				if (spanContent !== "normal") {
					style.innerHTML += `:host ${selector} > span:before { content: ${spanContent}; }\n`;
				}
			}
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
