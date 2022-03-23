export interface Repository {
  name: string
  description: string
  url: string
  createdAt: string
  stargazerCount: number
}

export type OutputFormat = 'json' | 'txt'

export interface ProgramConfig {
  /**
   * User id of your GitHub account.
   *
   * Will read from `PROGRAM_LOGIN` environment variable if not set.
   */
  login?: string

  /**
   * GitHub Token that have access to your sponsorships.
   *
   * Will read from `PROGRAM_TOKEN` environment variable if not set.
   *
   * @deprecated It's not recommended set this value directly, pass from env or use `.env` file.
   */
  token?: string

  /**
   * Bypass cache
   */
  force?: boolean

  /**
   * Output directory for generated files.
   *
   * @default './program'
   */
  outputDir?: string

  /**
   * Name of exported files
   *
   * @default 'repositories'
   */
  name?: string

  /**
   * Output formats
   *
   * @default ['json', 'txt']
   */
  formats?: OutputFormat[]

  /**
   * Path to cache file
   *
   * @default './program/.cache.json'
   */
  cacheFile?: string

  /**
   * Hook to modify repositories data before rendering.
   */
  onRepositoriesFetched?: (sponsors: Repository[]) => PromiseLike<void> | void
}
