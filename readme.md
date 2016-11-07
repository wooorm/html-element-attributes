# html-element-attributes [![Build Status][build-badge]][build-page] [![Coverage Status][coverage-badge]][coverage-page]

Map of HTML elements to allowed attributes.  Also contains global
attributes under `'*'`.  Includes attributes from HTML 4, W3C HTML 5,
and WHATWG HTML 5.

> **Note**: Includes deprecated attributes.
>
> **Note**: Attributes which were not global in HTML 4 but are in
> HTML 5, are only included in the list of global attributes.

## Installation

[npm][]:

```bash
npm install html-element-attributes
```

**html-element-attributes** is also available as an AMD, CommonJS, and
globals module, [uncompressed and compressed][releases].

## Usage

```javascript
var htmlElementAttributes = require('html-element-attributes');

var globals = htmlElementAttributes['*'];
```

Yields:

```js
[ 'accesskey',
  'class',
  'contenteditable',
  'contextmenu',
  'dir',
  'draggable',
  'dropzone',
  'hidden',
  'id',
  'itemid',
  'itemprop',
  'itemref',
  'itemscope',
  'itemtype',
  'lang',
  'spellcheck',
  'style',
  'tabindex',
  'title',
  'translate' ]
```

Attributes on the `ol` element:

```javascript
var ol = htmlElementAttributes.ol;
```

Yields:

```js
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

[build-page]: https://travis-ci.org/wooorm/html-element-attributes

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/html-element-attributes.svg

[coverage-page]: https://codecov.io/github/wooorm/html-element-attributes?branch=master

[npm]: https://docs.npmjs.com/cli/install

[releases]: https://github.com/wooorm/html-element-attributes/releases

[license]: LICENSE

[author]: http://wooorm.com
