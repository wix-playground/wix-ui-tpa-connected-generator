import * as fs from 'fs'
import * as path from 'path'

/**
 * Utility for working with file system
 */
export class FileSystem {
  /**
   * Scans files recursively
   * @param directory path of directory to scan for contents
   * @returns array of content paths
   */
  public static scan(directory: string) {
    let files: string[] = []

    fs.readdirSync(directory).forEach(fileName => {
      const fullPath = path.resolve(directory, fileName)
      if (fs.statSync(fullPath).isDirectory()) {
        files = files.concat(this.scan(fullPath))
      } else {
        files.push(fullPath)
      }
    })

    return files
  }
}
