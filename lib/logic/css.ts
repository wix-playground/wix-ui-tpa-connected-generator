import * as cssTree from 'css-tree'

/**
 * Utility which helps to work with CSS
 */
export class CSS {
  /**
   * Wraps existent CSS with a given namespace
   * Namespace is added to be used together with root selector (without space)
   * @param inputCss initial non-wrapped CSS code
   * @param namespace namespace name to be used
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
}
