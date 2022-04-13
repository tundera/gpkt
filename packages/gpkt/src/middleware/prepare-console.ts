import clear from 'console-clear'
import gradient from 'gradient-string'

export async function prepareConsole() {
  clear(true)
  console.log(gradient.pastel('gpkt package toolkit\n'))
}
