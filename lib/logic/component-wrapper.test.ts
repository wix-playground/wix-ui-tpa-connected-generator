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

    it('generates wrappers for all components', async () => {
      EXPECTED_COMPONENTS.forEach(componentName => {
        expect(fs.existsSync(path.resolve(OUTPUT_DIR, `${componentName}.js`))).toBeTruthy()
      })
    })
  })
})
