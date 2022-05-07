import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { allPosts, Post } from 'contentlayer/generated'
import { compareDesc } from 'date-fns'

import Home from 'pages'

test('home page renders correctly', () => {
  const posts: Post[] = allPosts.sort((a, b) => {
    return compareDesc(new Date(a.date), new Date(b.date))
  })

  render(<Home posts={posts} />)

  expect(screen.getByRole('heading', { name: /next\.js example/i })).toBeDefined()
})
