import * as fs from 'fs'
import * as path from 'path'
import * as rimraf from 'rimraf'
import {Analyser} from 'wix-ui-tpa-analyser'
import {IComponentStructure} from '../interfaces/shared'
import {Builder, IProjectVariableValues} from './builder'
import {CSS} from './css'

/**
 * Identification string for magic value
 * This value is used to identify where Stylable variable values are injected
 */
export const MAGIC_VALUE_PREFIX = 'wutc'

/**
 * Location of temporary build directory inside tmpPath
 */
export const BUILT_PROJECT_TMP_DIR = 'built'

/**
 * Analyses how Stylable variables are applied
 */
export class VariableAnalyser {
  private componentStructure: IComponentStructure
  private builder: Builder
  private tmpPath: string
  private namespace: string

  /**
   * Constructor
   * @param tmpPath path where temporary files can be stored during operation
   * @param namespace namespace to be used for building component styles
   */
  constructor(tmpPath: string, namespace: string) {
    this.tmpPath = tmpPath
    this.namespace = namespace
    const analyser = new Analyser(path.resolve(__dirname, '../..'))
    this.componentStructure = analyser.getComponentConfig()
    this.builder = new Builder(this.componentStructure, tmpPath)
  }

  public async getProjectVariableStructure(): Promise<IProjectVariableStructure> {
    await this.buildProject()

    const structure: IProjectVariableStructure = {}

    Object.keys(this.componentStructure).forEach(componentName => {
      const cssFile = path.resolve(this.tmpPath, BUILT_PROJECT_TMP_DIR, `${componentName}.bundle.css`)
      structure[componentName] = this.analyseCssFile(cssFile)
    })

    return structure
  }

  private async buildProject() {
    const buildPath = path.resolve(this.tmpPath, BUILT_PROJECT_TMP_DIR)
    const injectedVariableValues = this.getMagicVariableValues()
    rimraf.sync(buildPath)
    await this.builder.build(buildPath, injectedVariableValues, this.namespace)
  }

  private getMagicValueStart() {
    return `${MAGIC_VALUE_PREFIX}-${this.namespace}`
  }

  private getMagicValue(componentName: string, variableName: string) {
    return `--${this.getMagicValueStart()}-${componentName}-${variableName}`
  }

  private getMagicVariableValues(): IProjectVariableValues {
    const vars: IProjectVariableValues = {}

    Object.entries(this.componentStructure).forEach(([componentName, componentVars]) => {
      vars[componentName] = {}

      componentVars.forEach(variableName => {
        vars[componentName][variableName] = this.getMagicValue(componentName, variableName)
      })
    })

    return vars
  }

  private parseMagicValue(magicValue: string) {
    const parts = magicValue.split('-')
    const variableName = parts[parts.length - 1]
    const componentName = parts[parts.length - 2]
    return {variableName, componentName}
  }

  private analyseCssFile(filePath: string): IComponentVariableStructure {
    const styles = fs.readFileSync(filePath, {encoding: 'utf8'})
    const selectorInfo = CSS.getMagicValueSelectors(styles, this.getMagicValueStart())

    const structure: IComponentVariableStructure = {}

    Object.entries(selectorInfo).forEach(([magicValue, variableStructure]) => {
      const {variableName} = this.parseMagicValue(magicValue)
      structure[variableName] = variableStructure
    })

    return structure
  }
}

/**
 * Information about how variables of all project components are applied
 */
export interface IProjectVariableStructure {
  /**
   * Information about component variables
   */
  [componentName: string]: IComponentVariableStructure
}

/**
 * Information about how component variables are applied
 */
export interface IComponentVariableStructure {
  /**
   * Information about particular component variable
   */
  [variableName: string]: IVariableStructure[]
}

/**
 * Information where variable is applied in styles
 */
export interface IVariableStructure {
  /**
   * Media query selector if it is needed
   */
  mediaQuery?: string

  /**
   * Full CSS selector used to apply variable value
   */
  selector: string

  /**
   * CSS rule which is used to apply variable value to.
   * For example - color.
   */
  declaration: string
}
