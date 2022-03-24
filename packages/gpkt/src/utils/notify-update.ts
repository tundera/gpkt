import * as colorette from 'colorette'
import checkForUpdate from 'update-check'

import { getPkgManager } from './get-pkg-manager'
import packageJson from '../../package.json'

export async function notifyUpdate(): Promise<void> {
  try {
    const update = checkForUpdate(packageJson)

    const res = await update
    if (res?.latest) {
      const pkgManager = getPkgManager()

      console.log()
      console.log(colorette.yellow(colorette.bold('A new version of `gpkt` is available!')))
      console.log(
        'You can update by running: ' +
          colorette.cyan(
            pkgManager === 'yarn' ? 'yarn global add gpkt' : `${pkgManager} install --global gpkt`,
          ),
      )
      console.log()
    }
    process.exit()
  } catch {
    // ignore error
  }
}
