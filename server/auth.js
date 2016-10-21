'use strict'

const google = require('googleapis')
const userinfo = google.oauth2('v2').userinfo
const OAuth2 = google.auth.OAuth2
const path = require('path')

const store = require('./store.js')

// load env variables
if (process.env.HEROKU === undefined || process.env.HEROKU !== 'yes') {
  const dotenv = require('dotenv')
  dotenv.config({path: path.join(__dirname, '/../.env')})
  dotenv.load()
}

// set up OAuth
const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL)
google.options({ auth: oauth2Client }) // set auth as a global default
//
const AUTH_URL = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: ['https://www.googleapis.com/auth/userinfo.profile']
})

const authorize = function (res, req, successCallback, errorCallback = null) {
  readTokens(
    res, req,
    // if auth via tokens stored in cookie is possible, carry on
    () => {
      return successCallback()
    },
    // otherwise redirect to auth
    () => {
      if (errorCallback) {
        // used for index page
        errorCallback()
      } else {
        console.log('couldn\'t read tokens from cookie, proceeding to auth')
        return res.redirect(AUTH_URL)
      }
    }
  )
}

const getUserInfo = (res) => new Promise((resolve, reject) => {
  userinfo.get({
    auth: oauth2Client,
    fields: 'given_name,family_name'
  }, function (err, info) {
    if (err) {
      reject('Google service err (getting userinfo): ' + err)
    }
    store.set('USER_INFO', info, res)
    resolve(res)
  })
})

// read creds
const readTokens = (res, req, successCallback, errorCallback) => {
  const tokens = store.get('CREDENTIALS', req)
  if (tokens === undefined) {
    return errorCallback()
  }

  oauth2Client.refreshAccessToken(function (err, tokens) {
    if (err) {
      errorCallback()
      console.log('Error in refreshAccessToken', err)
      // revoke if we have a problem here, to start clean
      revoke()
      return
    }

    oauth2Client.setCredentials(tokens)
    store.set('CREDENTIALS', tokens, res)

    successCallback()
  })
}

const revoke = () => {
  oauth2Client.revokeCredentials(function (err, result) {
    if (err) {
      console.log('Error in revokeCredentials', err)
      return
    }
  })
}

module.exports = {
  oauth2Client,
  getUserInfo,
  authorize,
  revoke
}
