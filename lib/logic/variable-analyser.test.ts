import * as path from 'path'
import * as rimraf from 'rimraf'
import {VariableAnalyser} from './variable-analyser'

jest.setTimeout(15000)

const TEST_NAMESPACE = 'NAMESPACE'

const CACHE_DIR = path.resolve(__dirname, '../../cache/builder')

const EXPECTED_BUTTON_MAIN_TEXT_COLOR_STRUCTURE = [
  {
    selector: '.NAMESPACE.s[data-button-priority=basic]',
    declaration: 'color',
  },
  {
    selector: '.NAMESPACE.s[data-button-priority=primary]',
    declaration: 'color',
  },
  {
    selector: '.NAMESPACE.s[data-button-priority=secondary]',
    declaration: 'color',
  },
  {
    selector:
      '.NAMESPACE.s[data-button-priority=secondary]:active,.NAMESPACE.s[data-button-priority=secondary]' +
      ':hover,.NAMESPACE.s[data-button-priority=secondary][data-focusable-focus]',
    declaration: 'color',
  },
]

let variableAnalyser: VariableAnalyser

describe('VariableAnalyser', () => {
  beforeAll(() => {
    variableAnalyser = new VariableAnalyser(path.resolve(__dirname, '../..'), CACHE_DIR, TEST_NAMESPACE)
  })

  afterAll(() => {
    rimraf.sync(CACHE_DIR)
  })

  describe('getProjectVariableStructure', () => {
    it('provides information about where Button component variables are applied in CSS', async () => {
      const structure = await variableAnalyser.getProjectVariableStructure()
      expect(structure.Button).toBeDefined()
      expect(structure.Button.MainTextColor).toBeDefined()
      expect(normalizeSelectors(structure.Button.MainTextColor)).toEqual(
        normalizeSelectors(EXPECTED_BUTTON_MAIN_TEXT_COLOR_STRUCTURE),
      )
    })
  })
})

const normalizeSelectors = (data: any) =>
  data.map((item: any) => ({...item, selector: item.selector.replace(/[0-9]+/g, '')}))
