import path from 'path'
import nodepath from 'node:path'

const basename = f => path.basename(f)

const dirname = f => path.dirname(f)

const nodedirname = f => nodepath.dirname(f)

export {
  basename,
  dirname,
  nodedirname
}
