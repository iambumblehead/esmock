import express from 'express'
import passport from 'passport'

const app = express()

passport.use('bearerStrategy')
app.use(passport.initialize())
