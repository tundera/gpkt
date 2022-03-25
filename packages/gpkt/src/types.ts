export interface ParsedArguments {
  [key: string]: any

  /**
   * The project directory for the generated application.
   */
  projectDirectory?: string

  /**
   * Explicitly tell the CLI to bootstrap the app using npm
   */
  useNpm?: boolean

  /**
   * Explicitly tell the CLI to bootstrap the app using pnpm
   */
  usePnpm?: boolean

  /**
   * Use one of the official Gpkt presets to bootstrap the project with.
   * Current presets include `react`, `vue`, `node`, and `cli`.
   */
  preset?: string

  /**
   * A template to bootstrap the project with. The URL can use any
   * branch and/or subdirectory
   */
  template?: string

  /**
   * In a rare case, your GitHub URL might contain a branch name with
   * a slash (e.g. bug/fix-1) and the path to the template (e.g. foo/bar).
   * In this case, you must specify the path to the template separately:
   * --template-path foo/bar
   */
  templatePath?: string

  /**
   * Skip installing dependencies in the generated project.
   */
  skipInstall?: boolean
}
