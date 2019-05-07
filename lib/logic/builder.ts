import * as ejs from 'ejs'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import {IComponentStructure} from '../interfaces/shared'
import {FileSystem} from './file-system'

/**
 * Placeholder used in template file names
 * It is replaced to actual component name when interpolated
 */
export const COMPONENT_NAME_PLACEHOLDER = '$component'

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
  constructor(componentStructure: IComponentStructure, templatePath: string, tmpPath: string) {
    this.componentStructure = componentStructure
    this.tmpPath = tmpPath
    this.prepareTmpPath()
    this.loadTemplate(templatePath)
  }

  /**
   * Builds consumed components
   * @param outputPath path where consumed components need to be built
   * @param injectedVariableValues variable values to be injected
   */
  public build(outputPath: string, injectedVariableValues: IProjectVariableValues = {}) {
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
      const fileName = path.basename(relativeTemplatePath, 'ejs').replace(COMPONENT_NAME_PLACEHOLDER, componentName)
      const content = ejs.render(template, {componentName, variables})
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
