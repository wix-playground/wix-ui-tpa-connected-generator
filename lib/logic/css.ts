import * as cssTree from 'css-tree'
import {IVariableStructure} from './variable-analyser'

/**
 * Utility which helps to work with CSS
 */
export class CSS {
  /**
   * Wraps existent CSS with a given namespace
   * Namespace is added to be used together with root selector (without space)
   * @param inputCss initial non-wrapped CSS code
   * @param namespace namespace name to be used
   * @returns wrapped styles
   */
  public static wrap(inputCss: string, namespace: string) {
    const ast = cssTree.parse(inputCss)

    cssTree.walk(ast, {
      enter: node => {
        if (node.type === 'SelectorList') {
          node.children.map(selector => {
            const definition: any = cssTree.toPlainObject(selector)

            const namespaceDefinition: cssTree.CssNodePlain = {
              type: 'ClassSelector',
              name: namespace,
            }

            definition.children.unshift(namespaceDefinition)

            return cssTree.fromPlainObject(definition)
          })
        }
      },
    })

    return cssTree.generate(ast)
  }

  /**
   * Extracts information about magic variable locations inside CSS
   * @param cssSource source code of styles
   * @param magicValueStart start of magic variable values (because ending carries some varying information)
   * @returns variable value selectors
   */
  public static getMagicValueSelectors(cssSource: string, magicValueStart: string): IMagicValueLocations {
    const selectorInfo: IMagicValueLocations = {}

    const ast = cssTree.parse(cssSource)

    let mediaQueryList: cssTree.CssNode = null
    let selectorList: cssTree.CssNode = null
    let declaration: string = null

    cssTree.walk(ast, {
      enter: node => {
        if (node.type === 'MediaQueryList') {
          mediaQueryList = node
        } else if (node.type === 'SelectorList') {
          selectorList = node
        } else if (node.type === 'Declaration') {
          declaration = node.property
        } else if (node.type === 'String' && node.value.includes(magicValueStart)) {
          const selector = cssTree.generate(selectorList)
          const mediaQuery = mediaQueryList ? cssTree.generate(mediaQueryList) : null
          const magicValue = this.extractMagicValue(node.value, magicValueStart)

          const singleSelectorInfo: IVariableStructure = {selector, declaration}

          if (mediaQuery) {
            singleSelectorInfo.mediaQuery = mediaQuery
          }

          selectorInfo[magicValue] = selectorInfo[magicValue] || []
          selectorInfo[magicValue].push(singleSelectorInfo)
        }
      },
      leave: node => {
        if (node.type === 'Atrule') {
          mediaQueryList = null
        } else if (node.type === 'Rule') {
          selectorList = null
        } else if (node.type === 'Declaration') {
          declaration = null
        }
      },
    })

    return selectorInfo
  }

  private static extractMagicValue(data: string, magicValueStart: string) {
    const expression = new RegExp(`--${magicValueStart}-[a-zA-Z0-9_]+-[a-zA-Z0-9_]+`)
    const matches = data.match(expression)
    return matches ? matches[0] : null
  }
}

/**
 * Located magic values and their locations inside styles
 */
export interface IMagicValueLocations {
  /**
   * List of selectors which store the magic value
   */
  [magicValue: string]: IVariableStructure[]
}
