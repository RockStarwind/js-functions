/*
 ─────────────────────────────────────────────────────────────────────────────
 Author: @RockStarwind
 Creation Date: 2020-04-16
 Updated Date: 2020-04-19
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
	
	// Get and Set pseudo attribute
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
	
	// Get and Set pseudo names
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
	
	// Initialize extending elements with pseudo functionality 
	init: function (el) {
		var shadow = el.attachShadow({mode: 'open'});
		var content = el.innerHTML;
		var pseudos = el.pseudos;
		var pseudosNames = el.pseudosNames;
		var self = el;
		el.render(content, pseudos);
		
		setInterval(function () {
			if (
				pseudos !== el.pseudos ||
				pseudosNames !== el.pseudosNames
			) {
				pseudos = el.pseudos;
				pseudosNames = el.pseudosNames;
				content = el.innerHTML;
				el.rerender(content, pseudos)
			}
		}, 500);
	},
	
	// Re-render the contents
	rerender: function (content, pseudos, el) {
		content = content || el.innerHTML;
		pseudos = Number(pseudos) || el.pseudos || 1;
		var shadow = el.shadowRoot;
		shadow.innerHTML = "";
		el.render(content, pseudos);
	},
	
	// Render the contents
	render: function (content, pseudos, el) {
		content = content || el.innerHTML;
		pseudos = Number(pseudos) || el.pseudos || 1;
		var pseudosNames = el.pseudosNames || "";
		
		// Modify content of pseudosNames
		if (pseudosNames) {
			// Split pseudosNames by whitespace
			pseudosNames = pseudosNames.split(" "); 
			// Loop through pseudosNames array, check for a match. pseudosName must begin with a letter (A-Z), rest of the name must comprise of letters (A-Z), numbers, hyphens, and underscores
			for (var i = 0; i < pseudosNames.length; i) {
				if ((/^(([a-zA-Z]){1}([a-zA-Z0-9-_]*))$/i).test(pseudosNames[i])) {
					i++; // Proceed
				} else {
					pseudosNames.splice(i, 1); // Remove from array
				}
			}
		}
		
		// Create shadow and style
		var shadow = el.shadowRoot;
		var style = document.createElement("style");
		style.innerHTML = `
			:host .shadowpseudo > span:before { content: var(--content); }
			:host .shadowpseudo > span:after { content: none; }
		`;
		
		// Create innerHTML slot and before/after templates
		var slot = document.createElement("slot");
		slot.innerHTML = el.innerHTML;
		var templateBefore = document.createElement("template");
		var templateAfter = document.createElement("template");
		
		// Create and append befores and afters to templates
		for (var i = 0; i < pseudos; i++) {
			// Create part names for each generated shadow pseudo
			var beforeNames = ["before", `nth-before-${(i + 1)}`, `nth-last-before-${(pseudos - i)}`];
			var afterNames = ["after", `nth-after-${(i + 1)}`, `nth-last-after-${(pseudos - i)}`];
			
			// Attach more names
			if ((i === pseudos - 1) && (i === 0)) {
				beforeNames.push("only-before");
				afterNames.push("only-after");
			}
			if (i === 0) {
				beforeNames.push("first-before");
				afterNames.push("first-after");
			}
			if (i === pseudos - 1) {
				beforeNames.push("last-before");
				afterNames.push("last-after");
			}
			// And an alias
			if (pseudosNames && pseudosNames[i]) {
				beforeNames.push(`named-before-${pseudosNames[i]}`);
				afterNames.push(`named-after-${pseudosNames[i]}`);
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
		
		// Attach elements to shadow
		shadow.appendChild(style);
		shadow.appendChild(templateBefore.content);
		shadow.appendChild(slot);
		shadow.appendChild(templateAfter.content);
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
