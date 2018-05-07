var API_URL = 'https://pvnpms.phmsa.dot.gov/PublicViewer/rest/services/'

module.exports = function getUrl (path, params) {
  var url = API_URL + path.replace(/^\//, '')
  if (!params) return url
  var query = Object.keys(params).reduce(function (acc, key) {
    acc.push(key + '=' + params[key])
    return acc
  }, []).join('&')
  return url + '?' + query
}
