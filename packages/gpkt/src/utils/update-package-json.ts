import fs from 'fs'
import path from 'path'
import os from 'os'

import { merge } from 'merge-anything'

/**
 * Create an overrides object for package.json field in the new project and merge
 * it with the provided pacakge.json in the template.
 */
export const updatePackageJson = async (rootDir: string, overrides: Record<string, any>) => {
  // Parse and update the template manifest file.
  const manifestPath = path.join(rootDir, 'package.json')

  if (!manifestPath) {
    throw new Error("No package.json found in the template's root.")
  }

  const { readPackage } = await import('read-pkg')
  const templatePkgJson = await readPackage({ cwd: rootDir, normalize: false })

  const manifest = merge(overrides, templatePkgJson)

  fs.writeFileSync(path.join(rootDir, 'package.json'), JSON.stringify(manifest, null, 2) + os.EOL)
}
