# Google APIs Boilerplate

  Auth with Google and use APIs.

## how to

  - create a project in [console.developers.google.com](https://console.developers.google.com/)
  - in project, create OAuth credentials and fill:
    - 'Authorized JavaScript origins' with `http://localhost:3000` and `<production-domain>`
    - 'Authorized redirect URIs' with `http://localhost:3000/authcallback` and `<production-domain>/authcallback`
  - create `.env` file with following entries from the credentials: `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URL`
  - run server locally - `$ npm run start`

## google stuff

  using OAuth2 Google library, creds are stored in cookies

  because of how [Google OAuth works](http://stackoverflow.com/a/10857806/3772847) you can only be logged in on local __or__ production version at a given time

  ([revoke access here](https://security.google.com/settings/security/permissions) if it auth trouble)
