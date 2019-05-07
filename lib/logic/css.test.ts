import {CSS} from './css'

const TEST_CSS = '.a .b .c { color: red }'

describe.only('CSS', () => {
  describe('wrap', () => {
    let wrappedCss: string

    beforeAll(() => {
      wrappedCss = CSS.wrap(TEST_CSS, 'namespace')
    })

    it('wraps CSS selectors with a given namespace', () => {
      expect(wrappedCss.startsWith('.namespace.a')).toBeTruthy()
    })
  })
})
