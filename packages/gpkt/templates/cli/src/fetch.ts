import { $fetch } from 'ohmyfetch'
import type { Repository } from './types'

const API = 'https://api.github.com/graphql'
const graphql = String.raw

const StarredRespositoriesQuery = graphql`
  query StarredRepositoriesQuery($login: String!, $cursor: String) {
    user(login: $login) {
      starredRepositories(
        first: 100
        after: $cursor
        orderBy: { field: STARRED_AT, direction: DESC }
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          nameWithOwner
          description
          url
          createdAt
          stargazerCount
        }
      }
    }
  }
`

export async function fetchRepositories(token: string, login: string): Promise<Repository[]> {
  const repositories = []
  let cursor
  do {
    const data = (await $fetch(API, {
      method: 'POST',
      body: {
        query: StarredRespositoriesQuery,
        variables: { login, cursor },
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })) as any
    repositories.push(...(data.data.user.starredRepositories.nodes || []))
    if (data.data.user.starredRepositories.pageInfo.hasNextPage)
      cursor = data.data.user.starredRepositories.pageInfo.endCursor
    else cursor = undefined
  } while (cursor)

  const processed = repositories.map(
    (raw): Repository => ({
      name: raw.nameWithOwner,
      description: raw.description,
      url: raw.url,
      createdAt: raw.createdAt,
      stargazerCount: raw.stargazerCount,
    }),
  )

  return processed
}
