/* global jest */

import { defineTest } from 'jscodeshift/src/testUtils'

/**
 * List of all test fixtures with an input and
 * output pair for each.
 */
const fixtures = ['basic'] as const
const name = 'add-import'

describe(name, () => {
  fixtures.forEach((test) =>
    defineTest(__dirname, name, null, `${name}/${test}`, {
      parser: 'ts',
    }),
  )
})
