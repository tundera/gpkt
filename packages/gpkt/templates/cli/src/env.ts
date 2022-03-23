import dotenv from 'dotenv'
import type { ProgramConfig } from './types'

export function loadEnv(): Partial<ProgramConfig> {
  dotenv.config()

  const config: Partial<ProgramConfig> = {
    login: process.env.PROGRAM_LOGIN || process.env.GITHUB_ID,
    token: process.env.PROGRAM_TOKEN || process.env.GITHUB_TOKEN,
    outputDir: process.env.PROGRAM_DIR,
  }

  for (const key of Object.keys(config) as (keyof ProgramConfig)[]) {
    if (config[key] == null) delete config[key]
  }

  return config
}
