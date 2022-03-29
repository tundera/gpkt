import * as colorette from 'colorette'
import updateCheck from 'update-check'

import { getPkgManager } from '../utils/get-pkg-manager'
import packageJson from '../../package.json'

export async function checkForUpdate(): Promise<void> {
  try {
    const update = updateCheck(packageJson)

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
  } catch (err) {
    console.error('Error checking for newer versions of Gpkt:', err)
  }
}
