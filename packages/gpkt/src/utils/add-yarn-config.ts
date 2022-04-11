import fs from 'fs'
import path from 'path'
import yaml from 'yaml'
import { execa } from 'execa'

export const addYarnConfig = async (rootDir: string) => {
  const yarnrcPath = path.join(rootDir, '.yarnrc.yml')

  if (!fs.existsSync(yarnrcPath)) {
    const settings = yaml.stringify({
      compressionLevel: 0,
      enableGlobalCache: true,
      nmMode: 'hardlinks-local',
      nodeLinker: 'node-modules',
    })

    fs.writeFileSync(yarnrcPath, settings, { encoding: 'utf8' })

    await execa('yarn', ['set', 'version', 'berry'])
  }
}
