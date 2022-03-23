import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
}

export function Box({ children }: ButtonProps) {
  return <div>{children}</div>
}
