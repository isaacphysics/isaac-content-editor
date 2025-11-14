@{%
	const moo = require("moo")

	const lexer = moo.compile({
		ws:        { match: /\s+/, lineBreaks: true },
		comma:     /,/,
		integer:   /[0-9]+/,
		funcStart: /(?:SUM|sum|MIN|min|MAX|max)\(/,
		funcEnd:   /\)/,
		jsonField: /[a-z][a-zA-Z0-9]*/,
	});
%}

@lexer lexer

# Entrypoint
MAIN -> WS EXPRESSION                             {% ([_ws, start]) => start %}

# Expression rules
EXPRESSION -> %integer                            {% ([integer]) => ({type: "LLMMarkingConstant", value: Number(integer.value)}) %} 
EXPRESSION -> %jsonField                          {% ([jsonField]) => ({type: "LLMMarkingVariable", name: jsonField.value}) %}
EXPRESSION -> %funcStart WS ARGUMENTS WS %funcEnd {% ([func, _ws1, args, _ws2, _fe]) => ({type: "LLMMarkingFunction", name: func.value.slice(0, -1).toUpperCase(), arguments: args}) %}

# Argument rules
ARGUMENTS -> EXPRESSION                           {% ([exp]) => exp  %}
ARGUMENTS -> EXPRESSION WS %comma WS ARGUMENTS    {% ([exp, _ws1, _c, _ws2, args]) => [exp].concat(args) %}

# Optional white space
WS -> %ws:*                                       {% (ws) => null %}
