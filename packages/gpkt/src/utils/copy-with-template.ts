import fs from 'fs/promises'
import path from 'path'
import ejs from 'ejs'

/**
 * Copies a file to a different location, running it through an optional ejs template
 */
export async function copyWithTemplate(from: string, to: string, variables = {}): Promise<void> {
  const generatedSource = await ejs.renderFile(from, variables, {
    async: true,
  })

  try {
    await fs.mkdir(path.dirname(to), { recursive: true })
  } catch (err) {
    console.error('Error creating directory', err)
  }

  return await fs.writeFile(to, generatedSource)
}
