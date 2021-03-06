import assert from 'assert'
import test from 'tape'
import {htmlElementAttributes} from './index.js'

var own = {}.hasOwnProperty

test('htmlElementAttributes', function (t) {
  t.equal(typeof htmlElementAttributes, 'object', 'should be an `object`')

  t.doesNotThrow(function () {
    /** @type {string} */
    var key

    for (key in htmlElementAttributes) {
      if (own.call(htmlElementAttributes, key)) {
        assert.ok(Array.isArray(htmlElementAttributes[key]), key)
      }
    }
  }, 'values should be array')

  t.doesNotThrow(function () {
    /** @type {string} */
    var key
    /** @type {string[]} */
    var props
    /** @type {number} */
    var index
    /** @type {string} */
    var prop
    /** @type {string} */
    var label

    for (key in htmlElementAttributes) {
      if (own.call(htmlElementAttributes, key)) {
        props = htmlElementAttributes[key]
        index = -1

        while (++index < props.length) {
          prop = props[index]
          label = prop + ' in ' + key

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
