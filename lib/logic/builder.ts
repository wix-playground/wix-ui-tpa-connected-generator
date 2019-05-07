import * as ejs from 'ejs'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import rimraf = require('rimraf')
import {IComponentStructure} from '../interfaces/shared'
import {FileSystem} from './file-system'

/**
 * Placeholder used in template file names
 * It is replaced to actual component name when interpolated
 */
export const COMPONENT_NAME_PLACEHOLDER = '$component'

/**
 * Location of templates
 */
export const TEMPLATE_PATH = path.resolve(__dirname, '../templates')

/**
 * Path to template for generate component consumers
 */
export const CONSUMER_TEMPLATE_PATH = path.resolve(TEMPLATE_PATH, 'consumers')

/**
 * Path to consumer webpack configuration template
 */
export const CONSUMER_WEBPACK_CONFIG_TEMPLATE_PATH = path.resolve(
  TEMPLATE_PATH,
  'webpack',
  'consumer.webpack.config.js.ejs',
)

/**
 * Location of temporary generated code when building
 */
export const GENERATED_CODE_TMP_DIR = 'generated'

/**
 * Location of generated webpack configuration
 */
export const GENERATED_WEBPACK_CONFIG_PATH = 'webpack/webpack.config.js'

/**
 * Temporary location for built code
 */
export const BUILT_CODE_TMP_DIR = 'built'

/**
 * Builds/generates components with or without injected variable values
 * Note that file and directory names of templates are renamed by replacing
 * $component with actual component name.
 */
export class Builder {
  private componentStructure: IComponentStructure
  private template: IComponentTemplate
  private tmpPath: string

  /**
   * Constructor
   * @param componentStructure components and their variables
   * @param templatePath path where component template is placed
   * @param tmpPath path where to store temporary files during operations
   */
  constructor(componentStructure: IComponentStructure, tmpPath: string) {
    this.componentStructure = componentStructure
    this.tmpPath = tmpPath
    this.prepareTmpPath()
    this.loadTemplate(CONSUMER_TEMPLATE_PATH)
  }

  /**
   * Builds consumed components
   * @param outputPath path where consumed components need to be built
   * @param injectedVariableValues variable values to be injected
   */
  public build(outputPath: string, injectedVariableValues: IProjectVariableValues = {}) {
    const generatedCodePath = path.resolve(this.tmpPath, GENERATED_CODE_TMP_DIR)
    rimraf.sync(generatedCodePath)
    this.generate(generatedCodePath, injectedVariableValues)
    this.generateConsumerWebpackConfig(outputPath)
    // TODO: Not finished
  }

  /**
   * Generates source code for consuming components
   * @param outputPath path where component consumption code needs to be placed
   * @param injectedVariableValues variable values to be injected
   */
  public generate(outputPath: string, injectedVariableValues: IProjectVariableValues = {}) {
    Object.entries(this.componentStructure).forEach(([componentName]) => {
      this.generateComponent(
        componentName,
        path.resolve(outputPath, componentName),
        injectedVariableValues[componentName] || {},
      )
    })
  }

  private generateConsumerWebpackConfig(outputPath: string) {
    const template = fs.readFileSync(CONSUMER_WEBPACK_CONFIG_TEMPLATE_PATH, {encoding: 'utf8'})
    const code = ejs.render(template, {input: path.resolve(this.tmpPath, GENERATED_CODE_TMP_DIR), output: outputPath})
    const generatedConfigPath = path.resolve(this.tmpPath, GENERATED_WEBPACK_CONFIG_PATH)
    mkdirp.sync(path.dirname(generatedConfigPath))
    fs.writeFileSync(generatedConfigPath, code, {encoding: 'utf8'})
  }

  private loadTemplate(templatePath: string) {
    const files = FileSystem.scan(templatePath)
    this.template = {}

    files.forEach(absolutePath => {
      const data = fs.readFileSync(absolutePath, {encoding: 'utf8'})
      const relativePath = path.relative(templatePath, absolutePath)
      this.template[relativePath] = data
    })
  }

  private prepareTmpPath() {
    mkdirp.sync(this.tmpPath)
  }

  private generateComponent(componentName: string, componentOutputPath: string, variables: IVariableValues = {}) {
    Object.entries(this.template).forEach(([relativeTemplatePath, template]) => {
      const targetDirname = path.resolve(componentOutputPath, path.dirname(relativeTemplatePath))
      mkdirp.sync(targetDirname)
      const fileName = path.basename(relativeTemplatePath, '.ejs').replace(COMPONENT_NAME_PLACEHOLDER, componentName)
      const content = ejs.render(template, {componentName, variables, componentModuleName: COMPONENT_NAME_PLACEHOLDER})
      fs.writeFileSync(path.resolve(targetDirname, fileName), content, {encoding: 'utf8'})
    })
  }
}

/**
 * Variable values for a set of components
 */
export interface IProjectVariableValues {
  /**
   * Component variable values
   */
  [componentName: string]: IVariableValues
}

/**
 * Map of variables and their values
 */
export interface IVariableValues {
  /**
   * Value of a variable
   */
  [variableName: string]: string
}

/**
 * Template contents
 */
export interface IComponentTemplate {
  /**
   * Content of a template file
   */
  [filePath: string]: string
}
