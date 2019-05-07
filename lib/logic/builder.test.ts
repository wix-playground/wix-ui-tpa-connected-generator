import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as rimraf from 'rimraf'
import {IComponentStructure} from '../interfaces/shared'
import {Builder, IProjectVariableValues} from './builder'

const MOCK_COMPONENT_STRUCTURE: IComponentStructure = {
  Button: ['MainBorderColor', 'MainBorderWidth'],
  Text: ['MainTextColor', 'MainTextFont'],
}

const INJECTED_VARIABLES: IProjectVariableValues = {
  Button: {
    MainBorderColor: 'borderColor',
    MainBorderWidth: 'borderWidth',
  },
  Text: {
    MainTextColor: 'color',
    MainTextFont: 'font',
  },
}

const OUTPUT_DIR = path.resolve(__dirname, '../../cache/test')

let builder: Builder

describe('Builder', () => {
  beforeAll(() => {
    jest.setTimeout(15000)
    builder = new Builder(MOCK_COMPONENT_STRUCTURE, path.resolve(__dirname, '../../cache/builder'))
  })

  describe('generate', () => {
    beforeAll(() => {
      builder.generate(OUTPUT_DIR, INJECTED_VARIABLES)
    })

    afterAll(() => {
      rimraf.sync(OUTPUT_DIR)
    })

    it('generates sources for each component', () => {
      expect(fs.readdirSync(OUTPUT_DIR)).toEqual(Object.keys(MOCK_COMPONENT_STRUCTURE))
    })

    it('injects component name into component source code', () => {
      const componentNames = Object.keys(MOCK_COMPONENT_STRUCTURE)
      const componentName = componentNames[componentNames.length - 1]
      const componentPath = path.resolve(OUTPUT_DIR, componentName, `${componentName}.js`)
      const source = fs.readFileSync(componentPath, {encoding: 'utf8'})
      expect(source.indexOf(componentName)).not.toBe(-1)
    })
  })

  describe('build', () => {
    beforeAll(done => {
      builder.build(OUTPUT_DIR, INJECTED_VARIABLES).then(() => {
        done()
      })
    })

    afterAll(() => {
      rimraf.sync(OUTPUT_DIR)
    })

    it('builds separate styles for each component', () => {
      // TODO: Not finished
    })

    it('builds JS for each component', () => {
      // TODO: Not finished
    })
  })
})
