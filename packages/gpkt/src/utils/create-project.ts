/* eslint-disable import/no-extraneous-dependencies */
import retry from 'async-retry'
import { red, green, cyan, bold } from 'colorette'
import fs from 'fs'
import path from 'path'
import {
  downloadAndExtractTemplate,
  downloadAndExtractRepo,
  getRepoInfo,
  hasTemplate,
  hasRepo,
  RepoInfo,
} from './templates'
import { makeDir } from './make-dir'
import { tryGitInit } from './git'
import { install } from './install'
import ora from 'ora'
import { isFolderEmpty } from './is-folder-empty'
import { getOnline } from './is-online'
import { isWriteable } from './is-writeable'
import { updatePackageJson } from './update-package-json'
import { copyDirectoryWithTemplate } from './copy-directory-with-template'
import { markFilesExecutable } from './mark-files-executable'
import { addYarnConfig } from './add-yarn-config'
import { removePnpmConfig } from './remove-pnpm-config'
import type { PackageManager } from './get-pkg-manager'

export class DownloadError extends Error {}

export async function createProject({
  name,
  projectPath,
  packageManager,
  skipInstall,
  preset,
  template,
  templatePath,
}: {
  name: string
  projectPath: string
  packageManager: PackageManager
  preset?: string
  template?: string
  templatePath?: string
  skipInstall?: boolean
}): Promise<void> {
  let repoInfo: RepoInfo | undefined

  if (template) {
    let repoUrl: URL | undefined

    try {
      repoUrl = new URL(template)
    } catch (error: any) {
      if (error.code !== 'ERR_INVALID_URL') {
        console.error(error)
        process.exit(1)
      }
    }

    if (repoUrl) {
      if (repoUrl.origin !== 'https://github.com') {
        console.error(
          `Invalid URL: ${red(
            `"${template}"`,
          )}. Only GitHub repositories are supported. Please use a GitHub URL and try again.`,
        )
        process.exit(1)
      }

      repoInfo = await getRepoInfo(repoUrl, templatePath)

      if (!repoInfo) {
        console.error(
          `Found invalid GitHub URL: ${red(`"${template}"`)}. Please fix the URL and try again.`,
        )
        process.exit(1)
      }

      const found = await hasRepo(repoInfo)

      if (!found) {
        console.error(
          `Could not locate the repository for ${red(
            `"${template}"`,
          )}. Please check that the repository exists and try again.`,
        )
        process.exit(1)
      }
    } else if (template !== '__internal-testing-retry') {
      const found = await hasTemplate(template)

      if (!found) {
        console.error(
          `Could not locate a template named ${red(
            `"${template}"`,
          )}. It could be due to the following:\n`,
          `1. Your spelling of template ${red(`"${template}"`)} might be incorrect.\n`,
          `2. You might not be connected to the internet.`,
        )
        process.exit(1)
      }
    }
  }

  const root = path.resolve(projectPath)

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      'The project path is not writable, please check folder permissions and try again.',
    )
    console.error('It is likely you do not have write permissions for this folder.')
    process.exit(1)
  }

  const projectDir = path.basename(root)

  await makeDir(root)
  if (!isFolderEmpty(root, projectDir)) {
    process.exit(1)
  }

  const useYarn = packageManager === 'yarn'
  const packageExecutor = packageManager === 'npm' ? 'npx' : packageManager
  const isOnline = !useYarn || (await getOnline())
  const originalDirectory = process.cwd()
  const templatesDirectory = path.join(__dirname, '../..', 'templates')

  process.chdir(root)

  const packageOverrides = {
    name: name,
    version: '0.1.0',
    license: 'MIT',
    repository: {
      type: 'git',
      url: `https://github.com/<username>/${name}`,
    },
    author: {
      name: 'Your Name',
      url: 'https://github.com/<username>',
      email: '<email>',
    },
  }

  if (template) {
    /**
     * If a template repository is provided, clone it.
     */
    try {
      if (repoInfo) {
        const repoInfo2 = repoInfo
        console.log(`Downloading files from repo ${cyan(template)}. This might take a moment.`)
        console.log()
        await retry(async () => await downloadAndExtractRepo(root, repoInfo2))
      } else {
        console.log(`Downloading files for template ${cyan(template)}. This might take a moment.`)
        console.log()
        await retry(async () => await downloadAndExtractTemplate(root, template))
      }
    } catch (reason) {
      function isErrorLike(err: unknown): err is { message: string } {
        return (
          typeof err === 'object' &&
          err !== null &&
          typeof (err as { message?: unknown }).message === 'string'
        )
      }
      throw new DownloadError(isErrorLike(reason) ? reason.message : reason + '')
    }

    await updatePackageJson(root, packageOverrides)

    /**
     * Copy our default `.gitignore` if the project did not provide one
     */
    const ignorePath = path.join(root, '.gitignore')
    if (!fs.existsSync(ignorePath)) {
      fs.copyFileSync(path.join(templatesDirectory, template, 'gitignore'), ignorePath)
    }

    if (!skipInstall) {
      console.log('Installing packages. This might take a couple of minutes.')
      console.log()

      const spinner = ora({
        text: 'Installing dependencies...',
        spinner: {
          frames: ['   ', '>  ', '>> ', '>>>'],
        },
      }).start()

      await install(root, null, { packageManager, isOnline })
      spinner.stop()
      console.log()
    } else {
      console.log('Skipping installation of project dependencies per request.')
      console.log()
    }
  } else {
    /**
     * Otherwise, if a template repository is not provided for cloning, proceed
     * by installing from a Gpkt preset.
     */
    console.log(bold(`Using ${packageManager}.`))
    console.log()

    const presetName = preset ?? 'node'

    console.log(bold(`Creating project with "${presetName}" preset.`))
    console.log()

    /**
     * Copy the template files to the target directory.
     */
    await copyDirectoryWithTemplate(path.join(templatesDirectory, presetName), root, {
      packageManager,
      packageExecutor,
    })

    /**
     * Mark shell files executable.
     */
    await markFilesExecutable(`${root}/.husky/*`)

    /**
     * If not using PNPM and the `pnpm` key is defined in the template
     * pacakge.json, remove it.
     */
    if (packageManager !== 'pnpm') {
      await removePnpmConfig(root)
    }

    /**
     * Create yarn config if using yarn as the package manager.
     */
    if (packageManager === 'yarn') {
      await addYarnConfig(root)
    }

    /**
     * Update package.json with the provided overrides and install
     * project dependencies.
     */
    await updatePackageJson(root, packageOverrides)

    const spinner = ora({
      text: 'Installing dependencies...',
      spinner: {
        frames: ['   ', '>  ', '>> ', '>>>'],
      },
    }).start()
    await install(root, null, { packageManager, isOnline })
    spinner.stop()

    console.log()

    /**
     * Replace template variables in the copied files.
     */

    console.log()
  }

  if (tryGitInit(root)) {
    console.log('Initialized a git repository.')
    console.log()
  }

  let cdpath: string
  if (path.join(originalDirectory, projectDir) === projectPath) {
    cdpath = projectDir
  } else {
    cdpath = projectPath
  }

  console.log(`${green('Success!')} Created ${name} at ${projectPath}\n`)
  console.log('Inside that directory, you can run several commands:\n')
  console.log(cyan(`  ${packageManager} ${useYarn ? '' : 'run '}build`))
  console.log('    Builds the package for production.\n')
  console.log(cyan(`  ${packageManager} ${useYarn ? '' : 'run '}dev`))
  console.log('    Watches source files and rebuilds package upon changes.\n')
  console.log(cyan(`  ${packageManager} start`))
  console.log('    Runs the built app in production mode.\n')
}
