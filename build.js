import fs from 'fs'
import https from 'https'
import concat from 'concat-stream'
import {bail} from 'bail'
import unified from 'unified'
import html from 'rehype-parse'
import q from 'hast-util-select'
import toString from 'hast-util-to-string'
import {htmlElementAttributes} from './index.js'

var processor = unified().use(html)

// Global attributes.
var globals = htmlElementAttributes['*']

if (!globals) {
  globals = []
  htmlElementAttributes['*'] = globals
}

// Crawl WHATWG HTML.
https.get('https://html.spec.whatwg.org/multipage/indices.html', onhtml)

function onhtml(response) {
  response.pipe(concat(onconcat)).on('error', bail)

  function onconcat(buf) {
    var nodes = q.selectAll('#attributes-1 tbody tr', processor.parse(buf))
    var index = -1
    var result = {}
    var keys
    var key
    var name
    var elements
    var tagName
    var attributes
    var offset

    // Throw if we didn’t match, e.g., when the spec updates.
    if (nodes.length === 0) {
      throw new Error('Missing results in html')
    }

    while (++index < nodes.length) {
      name = toString(nodes[index].children[0]).trim()
      elements = toString(nodes[index].children[1]).trim()

      if (/custom elements/i.test(elements)) {
        continue
      }

      offset = -1
      elements = /HTML elements/.test(elements)
        ? ['*']
        : elements.split(/;/g).map((d) => d.replace(/\([^)]+\)/g, '').trim())

      while (++offset < elements.length) {
        tagName = elements[offset].toLowerCase().trim()
        attributes =
          htmlElementAttributes[tagName] ||
          (htmlElementAttributes[tagName] = [])

        if (!attributes.includes(name)) {
          attributes.push(name)
        }
      }
    }

    keys = Object.keys(htmlElementAttributes).sort()
    index = -1

    while (++index < keys.length) {
      key = keys[index]
      htmlElementAttributes[key].sort()

      if (key !== '*') {
        htmlElementAttributes[key] = htmlElementAttributes[key].filter(
          function (attribute) {
            return !globals.includes(attribute)
          }
        )
      }

      if (htmlElementAttributes[key].length > 0) {
        result[key] = htmlElementAttributes[key]
      }
    }

    fs.writeFile(
      'index.js',
      'export var htmlElementAttributes = ' +
        JSON.stringify(result, null, 2) +
        '\n',
      bail
    )
  }
}
