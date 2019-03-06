let env = process.env.NODE_ENV || 'development'

if (env === 'development' || env === 'test') {
  const config = require('./config.json')
  let envConfig = config[env]
  console.log('Setting env variables for', env)
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key]
  })
}
