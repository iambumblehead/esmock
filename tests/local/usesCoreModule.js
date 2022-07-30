import fs from 'fs'

export const readPath = path => (
  fs.existsSync(path) && fs.readFileSync(path))

export const readSync = path => (
  fs.readFileSync(path))

export const checkNothing = () => false
