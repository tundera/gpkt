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
import { isFolderEmpty } from './is-folder-empty'
import { getOnline } from './is-online'
import { isWriteable } from './is-writeable'
import { updatePackageJson } from './update-package-json'
import type { PackageManager } from './get-pkg-manager'

export class DownloadError extends Error {}

export async function createProject({
  name,
  projectPath,
  packageManager,
  template,
  templatePath,
}: {
  name: string
  projectPath: string
  packageManager: PackageManager
  template?: string
  templatePath?: string
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
  const isOnline = !useYarn || (await getOnline())
  const originalDirectory = process.cwd()
  const templatesDirectory = path.join(__dirname, '../..', 'templates')

  const templateName = console.log(`Creating a new project in ${green(root)}.`)
  console.log()

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
        await retry(async () => await downloadAndExtractRepo(root, repoInfo2), {
          retries: 3,
        })
      } else {
        console.log(`Downloading files for template ${cyan(template)}. This might take a moment.`)
        console.log()
        await retry(async () => await downloadAndExtractTemplate(root, template), {
          retries: 3,
        })
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

    // // Copy default `next-env.d.ts` to any template that is typescript
    // const tsconfigPath = path.join(root, 'tsconfig.json')
    // if (fs.existsSync(tsconfigPath)) {
    //   fs.copyFileSync(
    //     path.join(templatesDirectory, 'typescript', 'next-env.d.ts'),
    //     path.join(root, 'next-env.d.ts'),
    //   )
    // }

    console.log('Installing packages. This might take a couple of minutes.')
    console.log()

    await install(root, null, { packageManager, isOnline })
    console.log()
  } else {
    /**
     * Otherwise, if a template repository is not provided for cloning, proceed
     * by installing from a template.
     */
    console.log(bold(`Using ${packageManager}.`))

    await updatePackageJson(root, packageOverrides)

    /**
     * These flags will be passed to `install()`.
     */
    const installFlags = { packageManager, isOnline }

    /**
     * Default dependencies.
     */
    const dependencies = ['react', 'react-dom', 'next']

    /**
     * Default devDependencies.
     */
    const devDependencies = ['eslint', 'eslint-config-next']

    /**
     * Install package.json dependencies if they exist.
     */
    if (dependencies.length) {
      console.log()
      console.log('Installing dependencies:')
      for (const dependency of dependencies) {
        console.log(`- ${cyan(dependency)}`)
      }
      console.log()

      await install(root, dependencies, installFlags)
    }

    /**
     * Install package.json devDependencies if they exist.
     */
    if (devDependencies.length) {
      console.log()
      console.log('Installing devDependencies:')
      for (const devDependency of devDependencies) {
        console.log(`- ${cyan(devDependency)}`)
      }
      console.log()

      const devInstallFlags = { devDependencies: true, ...installFlags }
      await install(root, devDependencies, devInstallFlags)
    }
    console.log()

    /**
     * Copy the template files to the target directory.
     */
    const { default: cpy } = await import('cpy')
    await cpy('**', root, {
      cwd: path.join(templatesDirectory, template as string),
      rename: (name) => {
        switch (name) {
          case 'gitignore':
          case 'eslintrc.json': {
            return '.'.concat(name)
          }
          // README.md is ignored by webpack-asset-relocator-loader used by ncc:
          // https://github.com/vercel/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
          case 'README-template.md': {
            return 'README.md'
          }
          default: {
            return name
          }
        }
      },
    })
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

  console.log(`${green('Success!')} Created ${name} at ${projectPath}`)
  console.log('Inside that directory, you can run several commands:')
  console.log()
  console.log(cyan(`  ${packageManager} ${useYarn ? '' : 'run '}dev`))
  console.log('    Starts the development server.')
  console.log()
  console.log(cyan(`  ${packageManager} ${useYarn ? '' : 'run '}build`))
  console.log('    Builds the app for production.')
  console.log()
  console.log(cyan(`  ${packageManager} start`))
  console.log('    Runs the built app in production mode.')
  console.log()
  console.log('We suggest that you begin by typing:')
  console.log()
  console.log(cyan('  cd'), cdpath)
  console.log(`  ${cyan(`${packageManager} ${useYarn ? '' : 'run '}dev`)}`)
  console.log()
}
