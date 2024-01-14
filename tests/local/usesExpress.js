import express from 'express'

export default () => {
  const router = express.Router()

  router.get('/route', (req, res, next) => {
    return [req, res, next]
  })

  return router
}
