import express from 'express'
import passport from 'passport'

const app = express()
const port = 7575

passport.use('bearerStrategy')

// app.use(passport.initialize())
if (typeof passport.initialize !== 'function') {
  throw new Error('inavalid mock')
}

if (!('_key' in passport)) {
  throw new Error('inavalid mock, enumerable props not discoverable')
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

export default Object.assign(app, {
  close: () => server.close()
})
