import path from 'path'
import pg from 'pg'

export default {
  pathbasenamewrap: (n: any) => path.basename(n),
  pgpoolwrap: (n: any) => pg.Pool(n)
}
