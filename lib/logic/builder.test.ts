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

let builder: Builder

describe('Builder', () => {
  const OUTPUT_DIR = path.resolve(__dirname, '../../cache/test/')
  const testPath = path.dirname(OUTPUT_DIR)

  beforeEach(() => {
    mkdirp.sync(testPath)

    builder = new Builder(
      MOCK_COMPONENT_STRUCTURE,
      path.resolve(__dirname, '../templates/consumers'),
      path.resolve(__dirname, '../../cache/builder'),
    )
  })

  afterEach(() => {
    rimraf.sync(testPath)
  })

  describe('generate', () => {
    it('generates sources for each component', () => {
      builder.generate(OUTPUT_DIR, INJECTED_VARIABLES)
      // TODO: Not finished
    })
  })
})
