import type { ArgumentsCamelCase } from 'yargs'
import React from 'react'
import { render, Box, Text } from 'ink'
import { cyan, red } from 'colorette'

import type { CreateArguments, CommandExecutor } from '../types'
import { Loading, Welcome } from '../components'

export const setup = async (args: ArgumentsCamelCase<CreateArguments>) => {
  try {
    await run(args)
  } catch (reason) {
    console.log()
    console.log('Aborting setup command')
    if ((reason as any).command) {
      console.log(`  ${cyan((reason as any).command)} has failed.`)
    } else {
      console.log(red('Unexpected error. Please report it as a bug:'))
      console.log(reason)
    }
    console.log()
    process.exit(1)
  }
}

const run: CommandExecutor<CreateArguments> = async (args) => {
  const activities = [
    {
      name: 'Create',
      message: 'Creating project...',
    },
    {
      name: 'Install',
      message: 'Installing dependencies...',
    },
  ]

  const setup = render(
    <Box flexDirection='column' alignItems='flex-start'>
      <Welcome />
      <Loading message='Setting up...' />
    </Box>,
  )
}
