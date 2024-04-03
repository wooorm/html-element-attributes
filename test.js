import assert from 'node:assert/strict'
import test from 'node:test'
import {htmlElementAttributes} from './index.js'

const own = {}.hasOwnProperty

test('htmlElementAttributes', function () {
  assert.equal(typeof htmlElementAttributes, 'object', 'should be an `object`')

  /** @type {string} */
  let key

  for (key in htmlElementAttributes) {
    if (own.call(htmlElementAttributes, key)) {
      assert.ok(Array.isArray(htmlElementAttributes[key]), key)
    }
  }

  for (key in htmlElementAttributes) {
    if (own.call(htmlElementAttributes, key)) {
      const properties = htmlElementAttributes[key]
      let index = -1

      while (++index < properties.length) {
        const property = properties[index]
        const label = property + ' in ' + key

        assert.strictEqual(
          typeof property,
          'string',
          label + ' should be string'
        )
        assert.strictEqual(
          property,
          property.toLowerCase(),
          label + ' should be lower-case'
        )
        assert.strictEqual(
          property,
          property.trim(),
          label + ' should be trimmed'
        )
        assert.ok(/^[a-z-]+$/.test(property), label + ' should be `a-z-`')
      }
    }
  }
})
