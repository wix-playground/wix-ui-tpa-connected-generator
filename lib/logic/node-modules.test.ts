import * as path from 'path'
import {NodeModules} from './node-modules'

const GOOD_MODULE = 'npm-dts-webpack-plugin'
const BAD_MODULE = 'fsdahslkdjhalskdjhaskld'

const nodeModules = new NodeModules(__dirname)

describe('NodeModules', () => {
  it('locates node module based on provided name', () => {
    expect(nodeModules.find(GOOD_MODULE)).toBe(path.resolve(__dirname, `../../node_modules/${GOOD_MODULE}`))
  })

  it('returns null whenever module cannot be located', () => {
    expect(nodeModules.find(BAD_MODULE)).toBeNull()
  })
})
