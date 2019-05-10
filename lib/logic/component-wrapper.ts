import * as fs from 'fs'
import * as path from 'path'
import * as rimraf from 'rimraf'
import {Analyser as StructureAnalyser} from 'wix-ui-tpa-analyser'
import {IComponentStructure} from '../interfaces/shared'
import {Builder} from './builder'
import {VariableAnalyser} from './variable-analyser'

/**
 * Location for temporary files when generating consumer wrappers
 */
export const CONSUMER_COMPONENT_TMP_DIR = 'consumers'

/**
 * Location for temporary files when generating component wrappers
 */
export const WRAPPER_COMPONENT_TMP_DIR = 'wrappers'

/**
 * Location where generated consumers would be stored temporarily
 */
export const CONSUMER_COMPONENT_OUTPUT_DIR = 'generated-consumers'

/**
 * Placeholder for injecting CSS styles into component JS implementation
 */
export const COMPONENT_STYLES_PLACEHOLDER = '{COMPONENT_STYLES}'

/**
 * Generates wrappers for WIX UI TPA components
 */
export class ComponentWrapper {
  private structureAnalyser: StructureAnalyser
  private variableAnalyser: VariableAnalyser
  private consumerTmpPath: string
  private consumerOutputPath: string
  private wrapperTmpPath: string
  private uniqueBuildHash: string

  /**
   * Constructor
   * @param projectRoot target project root
   * @param tmpPath path where temporary files can be stored during operation
   * @param uniqueBuildHash unique hash for current operation
   */
  constructor(projectRoot: string, tmpPath: string, uniqueBuildHash: string) {
    this.uniqueBuildHash = uniqueBuildHash

    this.consumerTmpPath = path.resolve(tmpPath, CONSUMER_COMPONENT_TMP_DIR)
    this.wrapperTmpPath = path.resolve(tmpPath, WRAPPER_COMPONENT_TMP_DIR)
    this.consumerOutputPath = path.resolve(tmpPath, CONSUMER_COMPONENT_OUTPUT_DIR)

    this.structureAnalyser = new StructureAnalyser(projectRoot)
    this.variableAnalyser = new VariableAnalyser(projectRoot, tmpPath, uniqueBuildHash)
  }

  /**
   * Builds component wrappers capable of connecting to settings via props
   * @param outputDir location where component wrappers need to be built into
   */
  public async build(outputDir: string) {
    const structure = this.structureAnalyser.getComponentConfig()
    const variables = await this.variableAnalyser.getProjectVariableStructure()

    const consumerBuilder = new Builder(structure, this.consumerTmpPath)
    consumerBuilder.generate(this.consumerOutputPath, {}, this.uniqueBuildHash)

    const wrapperBuilder = new Builder(
      structure,
      this.wrapperTmpPath,
      {
        consumerBasePath: path.relative(this.wrapperTmpPath, this.consumerOutputPath),
        projectVariableStructure: variables,
      },
      'wrappers',
    )

    await wrapperBuilder.build(outputDir)
    this.bundleCss(outputDir, structure)
  }

  private bundleCss(outputDir: string, componentStructure: IComponentStructure) {
    Object.keys(componentStructure).forEach(componentName => {
      const cssFile = path.resolve(outputDir, `${componentName}.bundle.css`)
      const jsFile = path.resolve(outputDir, `${componentName}.js`)

      const styles = fs.existsSync(cssFile) ? fs.readFileSync(cssFile, {encoding: 'utf8'}) : ''
      const code = fs.readFileSync(jsFile, {encoding: 'utf8'})

      const injectedCode = code.replace(new RegExp(`['"]${COMPONENT_STYLES_PLACEHOLDER}['"]`), JSON.stringify(styles))
      fs.writeFileSync(jsFile, injectedCode, {encoding: 'utf8'})

      rimraf.sync(cssFile)
    })
  }
}
