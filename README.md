# gpkt

Gpkt is the quickest way to get started building a new TypeScript package. This CLI tool enables you
to quickly start building a new project, with everything set up for you. You can create a package
using one of the
[official Gpkt templates](https://github.com/tundera/gpkt/tree/main/packages/gpkt/templates). To get
started, use the following command:

```bash
npx gpkt
```

To create a new app in a specific folder, you can send a name as an argument. For example, the
following command will create a new Next.js app called `blog-app` in a folder with the same name:

```bash
npx gpkt blog-app
```

## Options

`gpkt` comes with the following options:

- **--ts, --typescript** - Initialize as a TypeScript project.
- **-t, --template [name]|[github-url]** - A template to bootstrap the project with. You can use an
  template name from the [Gpkt repo](https://github.com/tundera/gpkt/tree/canary/templates) or a
  GitHub URL. The URL can use any branch and/or subdirectory.
- **--template-path &lt;path-to-template&gt;** - In a rare case, your GitHub URL might contain a
  branch name with a slash (e.g. bug/fix-1) and the path to the template (e.g. foo/bar). In this
  case, you must specify the path to the template separately: `--template-path foo/bar`
- **--use-npm** - Explicitly tell the CLI to bootstrap the app using npm. To bootstrap using yarn we
  recommend to run `yarn gpkt`
- **--use-pnpm** - Explicitly tell the CLI to bootstrap the app using pnpm. To bootstrap using yarn
  we recommend running `yarn gpkt`

## Why use Gpkt?

`gpkt` allows you to create a new Next.js app within seconds. It is officially maintained by the
creators of gpkt, and includes a number of benefits:

- **Interactive Experience**: Running `npx gpkt` (with no arguments) launches an interactive
  experience that guides you through setting up a project.
- **Zero Dependencies**: Initializing a project is as quick as one second. Gpkt has zero
  dependencies.
- **Offline Support**: Create Next App will automatically detect if you're offline and bootstrap
  your project using your local package cache.
- **Support for Examples**: Gpkt can bootstrap your project using an template from the Gpkt
  templates collection (e.g. `npx gpkt --template react`).
- **Tested**: The package is part of the gpkt monorepo and tested using the same integration test
  suite as Gpkt itself, ensuring it works as expected with every release.
