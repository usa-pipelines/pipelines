var request = require('request')

module.exports = request.defaults({
  headers: {
    'Referer': 'https://pvnpms.phmsa.dot.gov/PublicViewer/',
    'Accept': '*/*',
    'User-Agent': 'PublicViewer/1 CFNetwork/897.15 Darwin/17.5.0'
  },
  json: true
})
