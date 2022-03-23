import type { ProgramConfig } from './types'
import yargs from 'yargs'

import { run } from './run'
import { version } from '../package.json'

const cli = yargs
  .scriptName('template-cli')
  .usage('$0 [args]')
  .version(version)
  .strict()
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

cli.command(
  '*',
  'Generate',
  (args) =>
    args
      .option('force', {
        alias: 'f',
        default: false,
        type: 'boolean',
      })
      .option('name', {
        type: 'string',
      })
      .option('outputDir', {
        alias: ['o', 'dir'],
        type: 'string',
      })
      .strict()
      .help(),
  async (options) => {
    const config = options as ProgramConfig

    if (options._[0]) config.outputDir = options._[0] as string

    await run(options)
  },
)

cli.help().parse()
