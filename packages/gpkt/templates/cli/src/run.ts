import { dirname, join, relative, resolve } from 'path'
import fs from 'fs-extra'
import consola from 'consola'
import pc from 'picocolors'

import { version } from '../package.json'
import { loadConfig } from './config'
import { fetchRepositories } from './fetch'
import { generateRepositorySummary } from './utils'
import type { ProgramConfig, Repository } from './types'

function r(path: string) {
  return `./${relative(process.cwd(), path)}`
}

export async function run(inlineConfig?: ProgramConfig, logger = consola) {
  logger.log(`\n${pc.magenta(pc.bold('Program'))} ${pc.dim(`v${version}`)}\n`)

  const config = await loadConfig(inlineConfig)

  if (!config.token || !config.login)
    throw new Error('Environment variable PROGRAM_TOKEN & PROGRAM_LOGIN must be provided')

  const dir = resolve(process.cwd(), config.outputDir)
  const cacheFile = resolve(dir, config.cacheFile)

  let repositories: Repository[]
  if (!fs.existsSync(cacheFile) || config.force) {
    logger.info('Fetching starred repositories...')
    repositories = await fetchRepositories(config.token, config.login)
    await config.onRepositoriesFetched?.(repositories)
    logger.success(`${repositories.length} Repositories fetched`)

    await fs.ensureDir(dirname(cacheFile))
    await fs.writeJSON(cacheFile, repositories, { spaces: 2 })
  } else {
    repositories = await fs.readJSON(cacheFile)
    logger.success(`Loaded from cache ${r(cacheFile)}`)
  }

  await fs.ensureDir(dir)
  if (config.formats?.includes('json')) {
    const path = join(dir, `${config.name}.json`)
    await fs.writeJSON(path, repositories, { spaces: 2 })
    logger.success(`File written to ${r(path)}`)
  }

  if (config.formats?.includes('txt')) {
    const path = join(dir, `${config.name}.txt`)
    await fs.writeFile(path, '** Starred Repositories **\n', 'utf8')

    for (const repository of repositories) {
      const summary = generateRepositorySummary(repository)
      await fs.appendFile(path, summary)
    }
    logger.success(`File written to ${r(path)}`)
  }
}
