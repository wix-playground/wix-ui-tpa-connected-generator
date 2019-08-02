import * as path from 'path'
import * as uniqId from 'uniqid'
import {Cli, ECliArgument} from './cli'
import {ComponentWrapper} from './component-wrapper'

/**
 * Launches component wrapper generation based on CLI arguments
 */
export class Launcher extends Cli {
  /**
   * Constructor - launches generation based on CLI
   */
  constructor() {
    super()

    const targetPath = path.resolve(process.cwd(), this.getArgument(ECliArgument.targetPath))
    const tmpDir = path.resolve(process.cwd(), this.getArgument(ECliArgument.tmp))

    const componentWrapper = new ComponentWrapper(targetPath, tmpDir, this.getBuildHash())
    componentWrapper.build(targetPath)
  }

  private getBuildHash() {
    return `u${uniqId()}`
  }
}
