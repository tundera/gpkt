import j, { Transform } from 'jscodeshift'

import type { Program } from './types'
import { prepare } from './utils'

const chakraImport = j.importDeclaration(
  [j.importSpecifier(j.identifier('Box'))],
  j.literal('@chakra-ui/react'),
)

const transform: Transform = (file, api) => {
  const config = prepare(file, api)
  const { root, done } = config

  addImport(root, chakraImport)

  return done()
}

export default transform

export function addImport(root: Program, importToAdd: j.ImportDeclaration): Program {
  const importStatementCount = root.find(j.ImportDeclaration).length

  if (importStatementCount === 0) {
    root.find(j.Statement).at(0).insertBefore(importToAdd)
    return root
  }

  root.find(j.ImportDeclaration).forEach((stmt, idx) => {
    if (idx === importStatementCount - 1) {
      stmt.replace(stmt.node, importToAdd)
    }
  })

  return root
}
