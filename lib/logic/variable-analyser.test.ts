import * as path from 'path'
import {VariableAnalyser} from './variable-analyser'

const TEST_NAMESPACE = 'NAMESPACE'

const EXPECTED_BUTTON_MAIN_TEXT_COLOR_STRUCTURE = [
  {
    selector: '.NAMESPACE.s11[data-o3-priority=basic]',
    declaration: 'color',
  },
  {
    selector: '.NAMESPACE.s11[data-o3-priority=primary]',
    declaration: 'color',
  },
  {
    selector: '.NAMESPACE.s11[data-o3-priority=secondary]',
    declaration: 'color',
  },
  {
    selector:
      '.NAMESPACE.s11[data-o3-priority=secondary]:active,.NAMESPACE.s11[data-o3-priority=secondary]' +
      ':hover,.NAMESPACE.s11[data-o3-priority=secondary][data-o29-focus]',
    declaration: 'color',
  },
]

let variableAnalyser: VariableAnalyser

describe('VariableAnalyser', () => {
  beforeAll(() => {
    jest.setTimeout(120000)
    variableAnalyser = new VariableAnalyser(
      path.resolve(__dirname, '../..'),
      path.resolve(__dirname, '../../cache/builder'),
      TEST_NAMESPACE,
    )
  })

  describe('getProjectVariableStructure', () => {
    it('provides information about where Button component variables are applied in CSS', async () => {
      const structure = await variableAnalyser.getProjectVariableStructure()
      expect(structure.Button).toBeDefined()
      expect(structure.Button.MainTextColor).toBeDefined()
      expect(structure.Button.MainTextColor).toEqual(EXPECTED_BUTTON_MAIN_TEXT_COLOR_STRUCTURE)
    })
  })
})
