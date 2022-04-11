import React, { useEffect } from 'react'
import { useApp, Text } from 'ink'
import Spinner from 'ink-spinner'

type LoadingProps = {
  message?: string
}

export const Loading = ({ message }: LoadingProps) => {
  const { exit } = useApp()

  useEffect(() => {
    setTimeout(() => {
      exit()
    }, 1000)
  }, [])

  return (
    <Text>
      <Text color='green'>
        <Spinner type='dots' />
      </Text>{' '}
      {message}
    </Text>
  )
}
