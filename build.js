import fs from 'node:fs'
import https from 'node:https'
import concatStream from 'concat-stream'
import {bail} from 'bail'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import {selectAll} from 'hast-util-select'
import {toString} from 'hast-util-to-string'
import {htmlElementAttributes} from './index.js'

const own = {}.hasOwnProperty

const processor = unified().use(rehypeParse)

if (!('*' in htmlElementAttributes)) {
  htmlElementAttributes['*'] = []
}

// Global attributes.
const globals = htmlElementAttributes['*']

// Crawl WHATWG HTML.
https.get('https://html.spec.whatwg.org/multipage/indices.html', (response) => {
  response
    .pipe(
      concatStream((buf) => {
        const nodes = selectAll('#attributes-1 tbody tr', processor.parse(buf))
        /** @type {Record<string, Array<string>>} */
        const result = {}
        let index = -1

        // Throw if we didn’t match, e.g., when the spec updates.
        if (nodes.length === 0) {
          throw new Error('Missing results in html')
        }

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

        fs.writeFile(
          'index.js',
          [
            '/**',
            ' * Map of HTML elements to allowed attributes.',
            ' *',
            ' * @type {Record<string, Array<string>>}',
            ' */',
            'export const htmlElementAttributes = ' +
              JSON.stringify(result, null, 2),
            ''
          ].join('\n'),
          bail
        )
      })
    )
    .on('error', bail)
})
