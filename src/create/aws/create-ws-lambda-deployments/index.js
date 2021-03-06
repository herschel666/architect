var assert = require('@smallwins/validate/assert')
let series = require('run-series')
let create = require('./create')

module.exports = function createWebSocketLambdaDeployments(params, callback) {
  assert(params, {
    app: String,
    name: String,
  })
  let {app, name} = params
  let staging = `${app}-staging-${name}`
  let production = `${app}-production-${name}`
  series([
    create.bind({}, {...params, lambda:staging, env:'staging'}),
    create.bind({}, {...params, lambda:production, env:'production'})
  ],
  function done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}
