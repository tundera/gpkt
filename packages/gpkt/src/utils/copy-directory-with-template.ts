import fs from 'fs/promises'
import path from 'path'

import { copyWithTemplate } from './copy-with-template'

/**
 * Remove `.ejs` extension from the template filename
 */
export function cleanTemplateDestPath(file: string) {
  return file.replace(/\.ejs$/, '')
}

/**
 * Copies all rendered `ejs` templates from the `templates` directory to the destination directory
 */
export async function copyDirectoryWithTemplate(from: string, to: string, variables = {}) {
  const { globby } = await import('globby')

  try {
    await fs.mkdir(path.dirname(to), { recursive: true })
  } catch (e) {
    console.error('error making directory', e)
  }

  const files = await globby([`${from}/**/*.ejs`], { expandDirectories: true, dot: true })

  return await Promise.all(
    files.map(async (file) => {
      const toFile = cleanTemplateDestPath(file.replace(from, to))
      return copyWithTemplate(file, toFile, variables)
    }),
  )
}
