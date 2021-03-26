# html-element-attributes

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Map of HTML elements to allowed attributes.
Also contains global attributes under `'*'`.
Includes attributes from HTML 4 and HTML (the WHATWG living standard).

> **Note**: Includes deprecated attributes.
>
> **Note**: Attributes which were not global in HTML 4 but are in HTML, are only
> included in the list of global attributes.

## Install

This package is ESM only: Node 12+ is needed to use it and it must be `import`ed
instead of `require`d.

[npm][]:

```sh
npm install html-element-attributes
```

## Use

```js
import {htmlElementAttributes} from 'html-element-attributes'

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

This package exports the following identifiers: `htmlElementAttributes`.
There is no default export.

### `htmlElementAttributes`

`Object.<string, string[]>` — Map of lowercase tag names to an array of
lowercase attribute names.

The object contains one special key: `'*'`, which contains global
attributes that apply to all HTML elements.

## Related

*   [`web-namespaces`](https://github.com/wooorm/web-namespaces)
    — List of web namespaces
*   [`html-tag-names`](https://github.com/wooorm/html-tag-names)
    — List of HTML tags
*   [`mathml-tag-names`](https://github.com/wooorm/mathml-tag-names)
    — List of MathML tags
*   [`svg-tag-names`](https://github.com/wooorm/svg-tag-names)
    — List of SVG tags
*   [`html-void-elements`](https://github.com/wooorm/html-void-elements)
    — List of void HTML tag-names
*   [`svg-element-attributes`](https://github.com/wooorm/svg-element-attributes)
    — Map of SVG elements to allowed attributes
*   [`aria-attributes`](https://github.com/wooorm/aria-attributes)
    — List of ARIA attributes

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definition -->

[build-badge]: https://github.com/wooorm/html-element-attributes/workflows/main/badge.svg

[build]: https://github.com/wooorm/html-element-attributes/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/html-element-attributes.svg

[coverage]: https://codecov.io/github/wooorm/html-element-attributes

[downloads-badge]: https://img.shields.io/npm/dm/html-element-attributes.svg

[downloads]: https://www.npmjs.com/package/html-element-attributes

[size-badge]: https://img.shields.io/bundlephobia/minzip/html-element-attributes.svg

[size]: https://bundlephobia.com/result?p=html-element-attributes

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com
