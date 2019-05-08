import {CSS} from './css'

const TEST_CSS = '.a .b .c { color: red }'

describe('CSS', () => {
  describe('wrap', () => {
    let wrappedCss: string

    beforeAll(() => {
      wrappedCss = CSS.wrap(TEST_CSS, 'namespace')
    })

    it('wraps CSS selectors with a given namespace', () => {
      expect(wrappedCss.startsWith('.namespace.a')).toBeTruthy()
    })
  })

  describe('getMagicValueSelectors', () => {
    const TEST_MAGIC_HASH = 'magic-hash'

    const TEST_CSS_SOURCE = `
      .a .b.c { color: '--magic-hash-xxx-yyy' }
      @media only screen and (max-width: 600px) {
        .d, #f.g { background-color: '--magic-hash-xxx-yyy' }
      }
      .k { font: '--magic-hash-mmm-nnn' }
    `

    const EXPECTED_SELECTORS = {
      '--magic-hash-xxx-yyy': [
        {selector: '.a .b.c', declaration: 'color'},
        {selector: '.d,#f.g', declaration: 'background-color', mediaQuery: 'only screen and (max-width:600px)'},
      ],
      '--magic-hash-mmm-nnn': [{selector: '.k', declaration: 'font'}],
    }

    it('extracts selectors of magic value', () => {
      expect(CSS.getMagicValueSelectors(TEST_CSS_SOURCE, TEST_MAGIC_HASH)).toEqual(EXPECTED_SELECTORS)
    })
  })
})
