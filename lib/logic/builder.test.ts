import * as fs from 'fs'
import * as path from 'path'
import * as rimraf from 'rimraf'
import {IComponentStructure} from '../interfaces/shared'
import {Builder, IProjectVariableValues} from './builder'

jest.setTimeout(15000)

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
const CACHE_DIR = path.resolve(__dirname, '../../cache/builder')

const TEST_NAMESPACE = 'NAMESPACE'

let builder: Builder

describe('Builder', () => {
  beforeAll(() => {
    builder = new Builder(MOCK_COMPONENT_STRUCTURE, CACHE_DIR)
  })

  describe('generate', () => {
    beforeAll(() => {
      builder.generate(OUTPUT_DIR, INJECTED_VARIABLES)
    })

    afterAll(() => {
      rimraf.sync(OUTPUT_DIR)
      rimraf.sync(CACHE_DIR)
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
      builder.build(OUTPUT_DIR, INJECTED_VARIABLES, TEST_NAMESPACE).then(done, done)
    })

    afterAll(() => {
      rimraf.sync(OUTPUT_DIR)
    })

    it('builds separate styles for each component', () => {
      expect(fs.readdirSync(OUTPUT_DIR).filter(item => item.match(/\.css$/))).toEqual(
        Object.keys(MOCK_COMPONENT_STRUCTURE).map(componentName => `${componentName}.bundle.css`),
      )
    })

    it('builds JS for each component', () => {
      expect(fs.readdirSync(OUTPUT_DIR).filter(item => item.match(/\.js$/))).toEqual(
        Object.keys(MOCK_COMPONENT_STRUCTURE).map(componentName => `${componentName}.js`),
      )
    })

    it('wraps css with provided namespace', () => {
      const cssFile = fs.readdirSync(OUTPUT_DIR).filter(item => item.match(/\.css$/))[0]
      const cssStyles = fs.readFileSync(path.resolve(OUTPUT_DIR, cssFile), {encoding: 'utf8'})
      expect(cssStyles.indexOf(`${TEST_NAMESPACE}.`)).not.toBe(-1)
    })

    it('uses namespace in component logic', () => {
      const jsFile = fs.readdirSync(OUTPUT_DIR).filter(item => item.match(/\.js$/))[0]
      const code = fs.readFileSync(path.resolve(OUTPUT_DIR, jsFile), {encoding: 'utf8'})
      expect(code.indexOf(TEST_NAMESPACE)).not.toBe(-1)
    })
  })
})
