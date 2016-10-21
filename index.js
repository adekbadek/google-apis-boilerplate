'use strict'

const express = require('express')
const cookieParser = require('cookie-parser')

const store = require('./server/store.js')
const auth = require('./server/auth.js')

const app = express()
app.use(cookieParser())
app.set('port', (process.env.PORT || 3000))

// views and assets for web app
app.set('views', './front/views')
app.set('view engine', 'pug')

// web app starting point
app.get('/', function (req, res) {
  auth.authorize(res, req, () => {
    return res.render('index', {
      authorized: true,
      env: app.settings.env,
      userinfo: store.get('USER_INFO', req)
    })
  }, () => {
    return res.render('index', {
      authorized: false,
      env: app.settings.env
    })
  })
})

// url for authorizing app
app.get('/auth', function (req, res) {
  auth.authorize(res, req, () => {
    if (req && req.cookies.CREDENTIALS) {
      return res.redirect('/')
    }
  })
})

// clear cookies
app.get('/logout', function (req, res) {
  auth.revoke()
  for (var cookie in req.cookies) {
    res.clearCookie(cookie)
  }
  return res.redirect('/')
})

// endpoint hit on OAuth callback:
app.get('/authcallback', function (req, res) {
  auth.oauth2Client.getToken(res.req._parsedUrl.query.replace('code=', ''), function (err, tokens) {
    if (!err) {
      auth.oauth2Client.setCredentials(tokens)
      store.set('CREDENTIALS', tokens, res)

      auth.getUserInfo(res).then((response) => {
        return response.redirect('/auth')
      })
    }
  })
})

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'))
})
