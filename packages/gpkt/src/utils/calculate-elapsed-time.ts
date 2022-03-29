import convertHrtime from 'convert-hrtime'

export function calculateElapsedTime(startTime: bigint): string {
  const elapsed = process.hrtime.bigint() - startTime

  return convertHrtime(elapsed)[`seconds`].toFixed(3)
}
