import type { ArgumentsCamelCase } from 'yargs'
import consola from 'consola'
import path from 'path'
import prompts from 'prompts'
import { cyan, green, red, bold } from 'colorette'

import type { CreateArguments, CommandExecutor } from '../types'
import { createProject, DownloadError } from '../utils/create-project'
import { validateNpmName } from '../utils/validate-pkg'

export const create = async (args: ArgumentsCamelCase<CreateArguments>) => {
  consola.wrapAll()

  try {
    await run(args)
  } catch (reason) {
    console.log()
    console.log('Aborting new project creation.')
    if ((reason as any).command) {
      console.log(`  ${cyan((reason as any).command)} has failed.`)
    } else {
      console.log(red('Unexpected error. Please report it as a bug:'))
      console.log(reason)
    }
    console.log()
    process.exit(1)
  }

  consola.restoreAll()
}

const run: CommandExecutor<CreateArguments> = async (args) => {
  let name = args._[0] as string

  if (typeof name === 'string') {
    name = name.trim()
  }

  if (!name) {
    const res = await prompts({
      type: 'text',
      name: 'name',
      message: 'What is your project named?',
      initial: 'my-package',
      validate: (name) => {
        const validation = validateNpmName(name)
        if (validation.valid) {
          return true
        }
        return 'Invalid project name: ' + validation.problems![0]
      },
    })

    if (typeof res.name === 'string') {
      name = res.name.trim()
    }
  }

  if (!name) {
    console.log()
    console.log('Please specify the project name:')
    console.log(`  ${cyan(args.$0)} ${green('<name>')}`)
    console.log()
    console.log('For example:')
    console.log(`  ${cyan(args.$0)} ${green('my-package')}`)
    console.log()
    console.log(`Run ${cyan(`${args.$0} --help`)} to see all options.`)
    process.exit(1)
  }

  const { valid, problems } = validateNpmName(name)
  if (!valid) {
    console.error(
      `Could not create a project called ${red(`'${name}'`)} because of npm naming restrictions:`,
    )

    problems!.forEach((p) => console.error(`    ${red(bold('*'))} ${p}`))
    process.exit(1)
  }

  const projectPath = args.projectDirectory ?? name
  const resolvedProjectPath = path.resolve(projectPath)

  if (!!args.template === true) {
    console.error('Please provide a template name or url, otherwise remove the template option.')
    process.exit(1)
  }

  const packageManager = !!args.useNpm ? 'npm' : !!args.usePnpm ? 'pnpm' : 'yarn'

  const template = args.template && args.template.trim()

  try {
    await createProject({
      name,
      projectPath: resolvedProjectPath,
      packageManager,
      preset: args.preset,
      template,
      templatePath: args.templatePath,
      skipInstall: !!args.skipInstall,
    })
  } catch (reason) {
    if (!(reason instanceof DownloadError)) {
      throw reason
    }

    const res = await prompts({
      type: 'confirm',
      name: 'builtin',
      message:
        `Could not download "${template}" because of a connectivity issue between your machine and GitHub.\n` +
        `Do you want to use the default template (react) instead?`,
      initial: true,
    })
    if (!res.builtin) {
      throw reason
    }

    await createProject({
      name,
      projectPath: resolvedProjectPath,
      packageManager,
      template,
    })
  }
}
