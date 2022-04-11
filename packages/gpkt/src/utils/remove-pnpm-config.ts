import fs from 'fs'
import path from 'path'
import os from 'os'
import type { PackageJson } from 'read-pkg'

type PackageJsonWithPnpm = PackageJson & {
  pnpm?: {
    overrides?: {
      [key: string]: string
    }
    peerDependencyRules?: {
      ignoreMissing?: string[]
      allowedVersions?: {
        [key: string]: string
      }
    }
  }
}

/**
 * Remove pnpm-specific config from package.json
 */
export const removePnpmConfig = async (rootDir: string) => {
  // Parse and update the template manifest file.
  const manifestPath = path.join(rootDir, 'package.json')

  if (!manifestPath) {
    throw new Error("No package.json found in the template's root.")
  }

  const { readPackage } = await import('read-pkg')
  const templatePkgJson = (await readPackage({
    cwd: rootDir,
    normalize: false,
  })) as PackageJsonWithPnpm

  if (templatePkgJson.pnpm) {
    delete templatePkgJson.pnpm
  }

  fs.writeFileSync(
    path.join(rootDir, 'package.json'),
    JSON.stringify(templatePkgJson, null, 2) + os.EOL,
  )
}
