/**
 * Analyses how Stylable variables are applied
 */
export class VariableAnalyser {
  constructor() {
    // TODO: Not finished
  }

  public getProjectVariableStructure(): IProjectVariableStructure {
    // TODO: Not finished
    return {}
  }

  private buildProject() {
    // TODO: Not finished
  }

  private getMagicValue(componentName: string, variableName: string) {
    return `--wutc-${componentName}-${variableName}`
  }

  private analyseCssFile(filePath: string): IComponentVariableStructure {
    // TODO: Not finished
    return {}
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
  [variableName: string]: IVariableStructure
}

/**
 * Information where variable is applied in styles
 */
export interface IVariableStructure {
  /**
   * Full CSS selector used to apply variable value
   */
  selector: string

  /**
   * CSS rule which is used to apply variable value to.
   * For example - color.
   */
  declarationName: string
}
