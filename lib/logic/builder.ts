import * as ejs from 'ejs'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import rimraf = require('rimraf')
import * as webpack from 'webpack'
import {IComponentStructure} from '../interfaces/shared'
import {COMPONENT_STYLES_PLACEHOLDER} from './component-wrapper'
import {CSS} from './css'
import {FileSystem} from './file-system'
import {IProjectVariableStructure} from './variable-analyser'

/**
 * Name of module where modules reside
 */
export const COMPONENT_MODULE_NAME = 'wix-ui-tpa'

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
 * Builds/generates components wi§th or without injected variable values
 * Note that file and directory names of templates are renamed by replacing
 * $component with actual component name.
 */
export class Builder {
  private componentStructure: IComponentStructure
  private template: IComponentTemplate
  private tmpPath: string
  private additionalTemplateArgs: IAdditionalTemplateArgs

  /**
   * Constructor
   * @param componentStructure components and their variables
   * @param tmpPath path where to store temporary files during operations
   * @param additionalTemplateArgs more customization options for component generation
   */
  constructor(
    componentStructure: IComponentStructure,
    tmpPath: string,
    additionalTemplateArgs: IAdditionalTemplateArgs = {},
    templateName: string = 'consumers',
  ) {
    this.componentStructure = componentStructure
    this.tmpPath = tmpPath
    this.additionalTemplateArgs = additionalTemplateArgs

    this.prepareTmpPath()
    this.loadTemplate(path.resolve(TEMPLATE_PATH, templateName))
  }

  /**
   * Builds consumed components
   * @param outputPath path where consumed components need to be built
   * @param injectedVariableValues variable values to be injected
   * @param useCssNamespace wrap generated CSS with namespace if provided
   */
  public async build(outputPath: string, injectedVariableValues: IProjectVariableValues = {}, useCssNamespace = '') {
    const generatedCodePath = path.resolve(this.tmpPath, GENERATED_CODE_TMP_DIR)
    rimraf.sync(generatedCodePath)
    this.generate(generatedCodePath, injectedVariableValues, useCssNamespace)
    this.generateConsumerWebpackConfig(outputPath)
    await this.executeWebpack()

    if (useCssNamespace) {
      this.wrapGeneratedStyles(useCssNamespace, outputPath)
    }
  }

  /**
   * Generates source code for consuming components
   * @param outputPath path where component consumption code needs to be placed
   * @param injectedVariableValues variable values to be injected
   * @param useCssNamespace add namespace to className of component - should not used when calling this method directly
   */
  public generate(outputPath: string, injectedVariableValues: IProjectVariableValues = {}, useCssNamespace = '') {
    Object.entries(this.componentStructure).forEach(([componentName]) => {
      this.generateComponent(
        componentName,
        path.resolve(outputPath, componentName),
        injectedVariableValues[componentName] || {},
        useCssNamespace,
      )
    })
  }

  private wrapGeneratedStyles(namespace: string, outputPath: string) {
    Object.keys(this.componentStructure).forEach(componentName => {
      const cssFile = path.resolve(outputPath, `${componentName}.bundle.css`)
      const initialStyles = fs.readFileSync(cssFile, {encoding: 'utf8'})
      const wrappedStyles = CSS.wrap(initialStyles, namespace)
      fs.writeFileSync(cssFile, wrappedStyles, {encoding: 'utf8'})
    })
  }

  private executeWebpack() {
    const config = require(path.resolve(this.tmpPath, GENERATED_WEBPACK_CONFIG_PATH))

    return new Promise((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err || stats.hasErrors()) {
          reject()
        }

        resolve()
      })
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

  private generateComponent(
    componentName: string,
    componentOutputPath: string,
    variables: IVariableValues = {},
    namespace?: string,
  ) {
    Object.entries(this.template).forEach(([relativeTemplatePath, template]) => {
      const targetDirname = path.resolve(componentOutputPath, path.dirname(relativeTemplatePath))
      mkdirp.sync(targetDirname)
      const fileName = path.basename(relativeTemplatePath, '.ejs').replace(COMPONENT_NAME_PLACEHOLDER, componentName)

      const projectVariableStructure =
        this.additionalTemplateArgs.projectVariableStructure &&
        this.additionalTemplateArgs.projectVariableStructure[componentName]
          ? JSON.stringify(this.additionalTemplateArgs.projectVariableStructure[componentName])
          : JSON.stringify({})

      const additionalArgs: IPreparedAdditionalTemplateArgs = {...this.additionalTemplateArgs, projectVariableStructure}

      const content = ejs.render(template, {
        componentName,
        variables,
        componentModuleName: COMPONENT_MODULE_NAME,
        namespace,
        COMPONENT_STYLES_PLACEHOLDER,
        ...additionalArgs,
      })

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

/**
 * Overridable arguments accepted by templates
 */
export interface IAdditionalTemplateArgs {
  /**
   * Base path to compiled consumer component wrappers
   */
  consumerBasePath?: string

  /**
   * Serialized information about how component variables are injected into styles
   */
  projectVariableStructure?: IProjectVariableStructure
}

/**
 * Overridable arguments accepted by templates
 * Data is prepared for injection into templates
 */
export interface IPreparedAdditionalTemplateArgs {
  /**
   * Base path to compiled consumer component wrappers
   */
  consumerBasePath?: string

  /**
   * Serialized information about how component variables are injected into styles
   */
  projectVariableStructure?: string
}
