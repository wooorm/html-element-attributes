# html-element-attributes

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Map of HTML elements to allowed attributes.
Also contains global attributes under `'*'`.
Includes attributes from HTML 4 and HTML (the WHATWG living standard).

> **Note**: Includes deprecated attributes.
>
> **Note**: Attributes which were not global in HTML 4 but are in HTML, are only
> included in the list of global attributes.

## Installation

[npm][]:

```bash
npm install html-element-attributes
```

## Usage

```javascript
var htmlElementAttributes = require('html-element-attributes')

console.log(htmlElementAttributes['*'])
console.log(htmlElementAttributes.ol)
```

Yields:

```js
[ 'accesskey',
  'autocapitalize',
  'autofocus',
  'class',
  // ...
  'style',
  'tabindex',
  'title',
  'translate' ]
[ 'compact', 'reversed', 'start', 'type' ]
```

## API

### `htmlElementAttributes`

`Object.<Array.<string>>` — Map of lower-case tag-names to an array of
lower-case attribute names.

The object contains one special key: `'*'`, which contains global
attributes which apply to all HTML elements.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definition -->

[build-badge]: https://img.shields.io/travis/wooorm/html-element-attributes.svg

[build]: https://travis-ci.org/wooorm/html-element-attributes

[downloads-badge]: https://img.shields.io/npm/dm/html-element-attributes.svg

[downloads]: https://www.npmjs.com/package/html-element-attributes

[size-badge]: https://img.shields.io/bundlephobia/minzip/html-element-attributes.svg

[size]: https://bundlephobia.com/result?p=html-element-attributes

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com
