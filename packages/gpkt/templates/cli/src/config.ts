import { loadConfig as _loadConfig } from 'unconfig'
import { loadEnv } from './env'
import type { ProgramConfig } from './types'

export const defaultConfig: ProgramConfig = {
  name: 'program',
  outputDir: './program',
  cacheFile: '.cache.json',
  formats: ['json', 'txt'],
}

export function defineConfig(config: ProgramConfig) {
  return config
}

export async function loadConfig(inlineConfig?: ProgramConfig) {
  const env = loadEnv()

  const { config = {} } = await _loadConfig<ProgramConfig>({
    sources: [
      {
        files: 'program.config',
      },
    ],
    merge: true,
  })

  return {
    ...defaultConfig,
    ...env,
    ...config,
    ...inlineConfig,
  } as Required<ProgramConfig>
}
