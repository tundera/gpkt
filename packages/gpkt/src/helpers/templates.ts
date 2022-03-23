/* eslint-disable import/no-extraneous-dependencies */
import tar from 'tar'
import { Stream } from 'stream'
import { promisify } from 'util'

const pipeline = promisify(Stream.pipeline)

export type RepoInfo = {
  username: string
  name: string
  branch: string
  filePath: string
}

export async function isUrlOk(url: string): Promise<boolean> {
  try {
    const { default: got } = await import('got')
    const res: any = await got.head(url)
    return res.statusCode === 200
  } catch (err) {
    throw new Error((err as Error).message)
  }
}

export async function getRepoInfo(url: URL, templatePath?: string): Promise<RepoInfo | undefined> {
  const [, username, name, t, _branch, ...file] = url.pathname.split('/')
  const filePath = templatePath ? templatePath.replace(/^\//, '') : file.join('/')

  // Support repos whose entire purpose is to be a Gpkt template, e.g.
  // https://github.com/:username/:my-gpkt-template-repo-name.
  try {
    if (t === undefined) {
      const { default: got } = await import('got')
      const infoResponse: any = await got(`https://api.github.com/repos/${username}/${name}`)
      if (infoResponse.statusCode !== 200) {
        return
      }
      const info = JSON.parse(infoResponse.body)
      return { username, name, branch: info['default_branch'], filePath }
    }
  } catch (err) {
    throw new Error((err as Error).message)
  }

  // If templatePath is available, the branch name takes the entire path
  const branch = templatePath
    ? `${_branch}/${file.join('/')}`.replace(new RegExp(`/${filePath}|/$`), '')
    : _branch

  if (username && name && branch && t === 'tree') {
    return { username, name, branch, filePath }
  }
}

export function hasRepo({ username, name, branch, filePath }: RepoInfo): Promise<boolean> {
  const contentsUrl = `https://api.github.com/repos/${username}/${name}/contents`
  const packagePath = `${filePath ? `/${filePath}` : ''}/package.json`

  return isUrlOk(contentsUrl + packagePath + `?ref=${branch}`)
}

export function hasTemplate(name: string): Promise<boolean> {
  return isUrlOk(
    `https://api.github.com/repos/tundera/gpkt/contents/packages/gpkt/templates/${encodeURIComponent(
      name,
    )}/package.json`,
  )
}

export async function downloadAndExtractRepo(
  root: string,
  { username, name, branch, filePath }: RepoInfo,
): Promise<void> {
  const { default: got } = await import('got')
  return pipeline(
    got.stream(`https://codeload.github.com/${username}/${name}/tar.gz/${branch}`),
    tar.extract({ cwd: root, strip: filePath ? filePath.split('/').length + 1 : 1 }, [
      `${name}-${branch}${filePath ? `/${filePath}` : ''}`,
    ]),
  )
}

export async function downloadAndExtractTemplate(root: string, name: string): Promise<void> {
  if (name === '__internal-testing-retry') {
    throw new Error('This is an internal template for testing the CLI.')
  }

  const { default: got } = await import('got')

  return pipeline(
    got.stream('https://codeload.github.com/tundera/gpkt/tar.gz/main'),
    tar.extract({ cwd: root, strip: 5 }, [`gpkt-main/packages/gpkt/templates/${name}`]),
  )
}
