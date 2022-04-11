import fs from 'fs/promises'
import { constants } from 'fs'

/**
 * Mark files as executable
 */
export async function markFilesExecutable(pattern: string) {
  const { globby } = await import('globby')

  const files = await globby([pattern], { expandDirectories: true, dot: true })

  return await Promise.all(
    files.map(async (file) => {
      return fs.chmod(file, constants.X_OK)
    }),
  )
}
