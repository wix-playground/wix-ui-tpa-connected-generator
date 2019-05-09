import * as findNodeModules from 'find-node-modules'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Module for exploring node modules of target project
 */
export class NodeModules {
  public root: string

  /**
   * Constructor
   * @param targetProjectRoot root of project which contains node_modules
   */
  constructor(targetProjectRoot: string) {
    this.root = targetProjectRoot
  }

  /**
   * Retrieves root path for specific node module within the project
   * @param requiredModule name of module which needs to be located
   */
  public find(requiredModule: string) {
    const nodeModulePaths: string[] = findNodeModules(path.resolve(this.root))

    for (const relativePath of nodeModulePaths) {
      const absolutePath = path.resolve(this.root, relativePath)

      if (fs.existsSync(path.resolve(absolutePath, requiredModule))) {
        return path.resolve(absolutePath, requiredModule)
      }
    }

    return null
  }
}
