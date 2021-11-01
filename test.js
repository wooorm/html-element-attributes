import assert from 'node:assert'
import test from 'tape'
import {htmlElementAttributes} from './index.js'

const own = {}.hasOwnProperty

test('htmlElementAttributes', function (t) {
  t.equal(typeof htmlElementAttributes, 'object', 'should be an `object`')

  t.doesNotThrow(function () {
    /** @type {string} */
    let key

    for (key in htmlElementAttributes) {
      if (own.call(htmlElementAttributes, key)) {
        assert.ok(Array.isArray(htmlElementAttributes[key]), key)
      }
    }
  }, 'values should be array')

  t.doesNotThrow(function () {
    /** @type {string} */
    let key

    for (key in htmlElementAttributes) {
      if (own.call(htmlElementAttributes, key)) {
        const props = htmlElementAttributes[key]
        let index = -1

        while (++index < props.length) {
          const prop = props[index]
          const label = prop + ' in ' + key

          assert.strictEqual(typeof prop, 'string', label + ' should be string')
          assert.strictEqual(
            prop,
            prop.toLowerCase(),
            label + ' should be lower-case'
          )
          assert.strictEqual(prop, prop.trim(), label + ' should be trimmed')
          assert.ok(/^[a-z-]+$/.test(prop), label + ' should be `a-z-`')
        }
      }
    }
  }, 'name should be lower-case, alphabetical strings')

  t.end()
})
