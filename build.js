import fs from 'node:fs/promises'
import {fetch} from 'undici'
import {fromHtml} from 'hast-util-from-html'
import {selectAll} from 'hast-util-select'
import {toString} from 'hast-util-to-string'
import {htmlElementAttributes} from './index.js'

const own = {}.hasOwnProperty

if (!('*' in htmlElementAttributes)) {
  htmlElementAttributes['*'] = []
}

// Global attributes.
const globals = htmlElementAttributes['*']

// Crawl WHATWG HTML.
const response = await fetch(
  'https://html.spec.whatwg.org/multipage/indices.html'
)
const text = await response.text()

const nodes = selectAll('#attributes-1 tbody tr', fromHtml(text))

// Throw if we didn’t match, e.g., when the spec updates.
if (nodes.length === 0) {
  throw new Error('Missing results in html')
}

/** @type {Record<string, Array<string>>} */
const result = {}
let index = -1

while (++index < nodes.length) {
  const name = toString(nodes[index].children[0]).trim()
  const value = toString(nodes[index].children[1]).trim()

  if (/custom elements/i.test(value)) {
    continue
  }

  const elements = /HTML elements/.test(value)
    ? ['*']
    : value.split(/;/g).map((d) => d.replace(/\([^)]+\)/g, '').trim())
  let offset = -1

  while (++offset < elements.length) {
    const tagName = elements[offset].toLowerCase().trim()

    if (!own.call(htmlElementAttributes, tagName)) {
      htmlElementAttributes[tagName] = []
    }

    /** @type {string[]} */
    const attributes = htmlElementAttributes[tagName]

    if (!attributes.includes(name)) {
      attributes.push(name)
    }
  }
}

const keys = Object.keys(htmlElementAttributes).sort()
index = -1

while (++index < keys.length) {
  const key = keys[index]

  htmlElementAttributes[key].sort()

  if (key !== '*') {
    htmlElementAttributes[key] = htmlElementAttributes[key].filter(
      (/** @type {string} */ d) => !globals.includes(d)
    )
  }

  if (htmlElementAttributes[key].length > 0) {
    result[key] = htmlElementAttributes[key]
  }
}

await fs.writeFile(
  'index.js',
  [
    '/**',
    ' * Map of HTML elements to allowed attributes.',
    ' */',
    'export const htmlElementAttributes = /** @type {const} */ (' + JSON.stringify(result, null, 2) + ')',
    ''
  ].join('\n')
)
