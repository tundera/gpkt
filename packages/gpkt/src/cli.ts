import yargs from 'yargs'
import { cyan, red } from 'colorette'

import { run } from './run'
import { notifyUpdate } from './utils/notify-update'
import { name, version } from '../package.json'

const cli = yargs
  .scriptName(name)
  .version(version)
  .usage(`$0 <name> [options]`)
  .strictCommands()
  .command(
    '$0',
    'Create a new project from a template',
    (yargs) =>
      yargs
        .positional('name', {
          describe: 'The name of the project',
          type: 'string',
        })
        .option('project-directory', {
          alias: ['directory'],
          describe: 'The project directory for the generated application.',
          normalize: true,
          type: 'string',
        })
        .option('use-npm', {
          type: 'boolean',
          describe: 'Use npm as the package manager in the generated project.',
          conflicts: ['use-pnpm'],
        })
        .option('use-pnpm', {
          type: 'boolean',
          describe: 'Use pnpm as the package manager in the generated project.',
          conflicts: ['use-npm'],
        })
        .option('template', {
          alias: '-t',
          type: 'string',
          nargs: 1,
          describe:
            'A template to bootstrap the app with. You can use a template name from the official Gpkt repo or a GitHub URL. The URL can use any branch and/or subdirectory.',
          requiresArg: true,
        })
        .option('template-path', {
          type: 'string',
          nargs: 1,
          describe:
            'In a rare case, your GitHub URL might contain a branch name with a slash (e.g. bug/fix-1) and the path to the template (e.g. foo/bar). In this case, you must specify the path to the template separately: --template-path foo/bar.',
        })
        .option('skip-install', {
          type: 'boolean',
          describe: 'Skip installing dependencies in the generated project.',
          default: false,
        })
        .example('$0 my-package', `Create a new project named 'my-package'`),
    async (argv) => {
      try {
        await run(argv)
      } catch (reason) {
        console.log()
        console.log('Aborting installation.')
        if ((reason as any).command) {
          console.log(`  ${cyan((reason as any).command)} has failed.`)
        } else {
          console.log(red('Unexpected error. Please report it as a bug:'))
          console.log(reason)
        }
        console.log()

        await notifyUpdate()

        process.exit(1)
      } finally {
        await notifyUpdate()
        process.exit(0)
      }
    },
  )
  .command('install', 'Install an integration or run an installer script', (yargs) =>
    yargs
      .positional('name', {
        describe: 'The name of the integration or installer script',
        type: 'string',
      })
      .option('ignore-git', {
        alias: ['force'],
        describe: 'Ignore warnings from git.',
        type: 'boolean',
      }),
  )

cli.help().parse()
