import {foo} from 'ts-a'
import localfile from './local-file.js'

export default function test () {
  return foo()
}

export const localfilewrap = () => localfile()
