import type { Repository } from './types'

export function generateRepositorySummary(repository: Repository) {
  const name = repository.name.trim()
  const url = repository.url || `https://github.com/${repository.name}`

  return `
${name} (${url})
${repository.description}
${repository.stargazerCount} stars
${repository.createdAt}
`
}
