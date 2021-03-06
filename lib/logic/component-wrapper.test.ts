import * as fs from 'fs'
import * as path from 'path'
import * as rimraf from 'rimraf'
import {ComponentWrapper} from './component-wrapper'

jest.setTimeout(15000)

const OUTPUT_DIR = path.resolve(__dirname, '../../cache/e2e')
const CACHE_DIR = path.resolve(__dirname, '../../cache/wrapper')

const EXPECTED_COMPONENTS = [
  'Autocomplete',
  'Button',
  'Card',
  'Divider',
  'Input',
  'OverlappingCard',
  'Tabs',
  'Text',
  'ToggleSwitch',
]

describe('ComponentWrapper', () => {
  describe('generate', () => {
    beforeAll(done => {
      const componentWrapper = new ComponentWrapper(path.resolve(__dirname, '../..'), CACHE_DIR, 'HASH')
      componentWrapper.build(OUTPUT_DIR).then(done, done)
    })

    afterAll(() => {
      rimraf.sync(OUTPUT_DIR)
      rimraf.sync(CACHE_DIR)
    })

    it('generates wrappers for all components', () => {
      EXPECTED_COMPONENTS.forEach(componentName => {
        expect(fs.existsSync(path.resolve(OUTPUT_DIR, `${componentName}.js`))).toBeTruthy()
      })
    })

    it('generates CSS for all components', () => {
      EXPECTED_COMPONENTS.forEach(componentName => {
        expect(fs.existsSync(path.resolve(OUTPUT_DIR, `${componentName}.bundle.css`))).toBeTruthy()
      })
    })

    it('generates structure definition file', () => {
      const structurePath = path.resolve(OUTPUT_DIR, 'structure.json')

      expect(fs.existsSync(structurePath)).toBeTruthy()

      const expected = {
        Button: {
          MainBorderRadius: [
            {
              selector: '.HASH.s33',
              declaration: 'border-radius',
            },
          ],
        },
      }

      const actual = JSON.parse(fs.readFileSync(structurePath, {encoding: 'utf8'}))

      expect(actual).toMatchObject(expected)
    })
  })
})
