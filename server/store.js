'use strict'

const get = (what, res = null) => {
  if (res.cookies[what]) {
    return res.cookies[what]
  }
}

const set = (key, value, res = null) => {
  return res.cookie(key, value, { secure: process.env.NODE_ENV === 'production' })
}

module.exports = {
  get,
  set
}
