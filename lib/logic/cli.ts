import * as args from 'args'
import * as path from 'path'

/**
 * CLI argument names
 */
export enum ECliArgument {
  /**
   * Target path where components need to be generated to
   */
  targetPath = 'targetPath',

  /**
   * Temporary directory required during generation
   */
  tmp = 'tmp',
}

/**
 * Format for storing passed argument values
 */
export interface IGeneratorArgs {
  /**
   * Iterator
   */
  [argName: string]: string

  /**
   * Target path where components need to be generated to
   */
  targetPath?: string

  /**
   * Temporary directory required during generation
   */
  tmp?: string
}

/**
 * CLI usage logic
 */
export class Cli {
  /**
   * Stores whether module was successfully launched
   */
  protected launched = false

  /**
   * Stores current CLI argument values
   */
  private args: IGeneratorArgs = {
    targetPath: path.resolve(process.cwd()),
    tmp: path.resolve(process.cwd(), 'cache/tpacg'),
  }

  /**
   * Automatically reads CLI arguments and performs actions based on them
   */
  public constructor() {
    args
      .option(['p', 'targetPath'], 'Target path where components need to be generated to')
      .option(['t', 'tmp'], 'Directory for storing temporary information', this.args.tmp)
      .command('generate', 'Start generation', (name, sub, options) => {
        this.launched = true
        this.storeArguments(options)
      })
      .example('wutc-generator generate', 'Generates wrapper components.')
      .example('wutc-generator -p /your/project/path generate', 'Performs generation on a custom path.')

    args.parse(process.argv, {
      name: 'wutc-generator',
      mri: {},
      mainColor: 'yellow',
      subColor: 'dim',
    })

    if (!this.launched) {
      args.showHelp()
    }
  }

  /**
   * Gathers current value of a particular CLI argument
   * @param arg argument name
   */
  protected getArgument(arg: ECliArgument) {
    return this.args[arg]
  }

  /**
   * Stores entered CLI arguments
   * @param passedArguments arguments entered to CLI
   */
  private storeArguments(passedArguments: any = this.args) {
    for (const argName of Object.keys(this.args)) {
      this.args[argName] = Object.is(passedArguments[argName], undefined)
        ? this.args[argName]
        : passedArguments[argName]
    }
  }
}
