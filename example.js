// Dependencies:
var htmlElementAttributes = require('./index.js');

// Global attributes:
var globals = htmlElementAttributes['*'];

// Yields:
console.log('js', require('util').inspect(globals));

// Attributes on the `ol` element:
var ol = htmlElementAttributes.ol;

// Yields:
console.log('js', require('util').inspect(ol));
