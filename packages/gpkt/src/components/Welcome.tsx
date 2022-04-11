import React from 'react'
import Gradient from 'ink-gradient'
import BigText from 'ink-big-text'
import { Box, Text } from 'ink'

export const Welcome = () => {
  return (
    <Box flexDirection='column' height={8} width='100%' alignItems='center'>
      <Gradient name='pastel'>
        <BigText text='gpkt' font='tiny' />
      </Gradient>
      <Text bold>TypeScript package toolkit</Text>
    </Box>
  )
}
