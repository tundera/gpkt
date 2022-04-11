import yargs from 'yargs'
import { cyan } from 'colorette'

import { create, setup } from './handlers'
import { checkForUpdate, prepareConsole } from './middleware'
import { name, version } from '../package.json'

const cli = yargs
  .scriptName(name)
  .version(version)
  .usage(`Usage: $0 <command> [options]`)
  .help()
  .strictCommands()
  .command(
    ['create <name>', 'new <name>'],
    'Create a new project from a template',
    (yargs) =>
      yargs
        .usage(`Usage: $0 ${cyan('create')} <name> [options]`)
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
        .option('preset', {
          type: 'string',
          choices: ['react', 'vue', 'node', 'cli'] as const,
          nargs: 1,
          describe:
            'Use one of the official Gpkt presets to bootstrap the project with. Current presets include `react`, `vue`, `node`, and `cli`.',
          requiresArg: true,
          conflicts: ['template', 'template-path'],
        })
        .option('template', {
          alias: ['t'],
          type: 'string',
          nargs: 1,
          describe:
            'A template to bootstrap the app with. The URL can use any branch and/or subdirectory.',
          requiresArg: true,
          conflicts: ['preset'],
        })
        .option('template-path', {
          type: 'string',
          nargs: 1,
          describe:
            'In a rare case, your GitHub URL might contain a branch name with a slash (e.g. bug/fix-1) and the path to the template (e.g. foo/bar). In this case, you must specify the path to the template separately: --template-path foo/bar.',
          conflicts: ['preset'],
        })
        .option('skip-install', {
          type: 'boolean',
          describe: 'Skip installing dependencies in the generated project.',
          default: false,
        })
        .example(
          '$0 create component-library --preset react --use-pnpm',
          `Create a new project named 'component-library' with the 'react' preset and install dependencies with pnpm.`,
        ),
    create,
  )

cli.command(
  'setup',
  'Install an integration or run a setup script',
  (yargs) =>
    yargs
      .positional('name', {
        describe: 'The name of the integration or setup script',
        type: 'string',
      })
      .option('ignore-git', {
        alias: ['force'],
        describe: 'Ignore warnings from git.',
        type: 'boolean',
      }),
  setup,
)

cli.middleware(prepareConsole)
// cli.middleware(checkForUpdate)

cli.parse()
