import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as rimraf from 'rimraf'
import {IComponentStructure} from '../interfaces/shared'
import {Builder, IProjectVariableValues} from './builder'

const MOCK_COMPONENT_STRUCTURE: IComponentStructure = {
  Comp1: ['Comp1Var1', 'Comp1Var2'],
  Comp2: ['Comp2Var1', 'Comp2Var2'],
}

const INJECTED_VARIABLES: IProjectVariableValues = {
  Comp1: {
    Comp1Var1: 'Comp1Var1Val',
    Comp1Var2: 'Comp1Var2Val',
  },
  Comp2: {
    Comp2Var1: 'Comp2Var1Val',
    Comp2Var2: 'Comp2Var2Val',
  },
}

const OUTPUT_DIR = path.resolve(__dirname, '../../cache/test')

let builder: Builder

describe('Builder', () => {
  beforeAll(() => {
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
      const componentPath = path.resolve(OUTPUT_DIR, componentName, `${componentName}.ts`)
      const source = fs.readFileSync(componentPath, {encoding: 'utf8'})
      expect(source.indexOf(componentName)).not.toBe(-1)
    })
  })

  describe('build', () => {
    beforeAll(() => {
      builder.build(OUTPUT_DIR, INJECTED_VARIABLES)
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
