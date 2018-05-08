var wkx = require('wkx')

var request = require('./request')
var getUrl = require('./url')

var TOLERANCE_MILE = 8047 / 5
var TYPES = {
  all_hazardousliquidpipeline_dynamic: 'liquid',
  all_gastransmissionpipeline_dynamic: 'gas'
}

module.exports = getPipelines

/**
 * For a given point [lon, lat] get all the pipelines within a miles distMiles,
 * returns only segments of pipeline within the same county as point.
 * Returns an empty array if no pipelines are found
 */
function getPipelines (point, distMiles, countyFips, cb) {
  var tolerance = Math.ceil(distMiles * TOLERANCE_MILE)
  authenticateNearby(point, tolerance, function (err, filter, authRequest) {
    if (err) return cb(err)
    if (!filter) return cb(null, [])
    var layerDef = [{
      id: 'all_hazardousliquidpipeline_dynamic',
      filter: filter
    }, {
      id: 'all_gastransmissionpipeline_dynamic',
      filter: filter
    }]
    authRequest({
      url: getUrl('identify_layers'),
      method: 'POST',
      form: {
        lon: point[0],
        lat: point[1],
        tolerance: tolerance,
        layer: JSON.stringify(layerDef)
      }
    }, function (err, res, body) {
      if (err) return cb(err)
      var pipelines = Object.keys(TYPES).reduce((acc, key) => {
        if (!Array.isArray(body[key])) return acc
        return acc.concat(body[key].map(item => ({
          type: 'Feature',
          geometry: wkx.Geometry.parse(item.geom).toGeoJSON(),
          properties: Object.keys(item)
            .filter(key => key !== 'geom')
            .reduce((acc, key) => {
              acc[key] = item[key]
              return acc
            }, {
              type: TYPES[key],
              county_fips: countyFips
            })
        })))
      }, [])
      cb(null, pipelines)
    })
  })
}

/**
 * Fetch a CSRF token and a session cookie and return a modified request
 * object with the cookie and token set as headers as default
 */
function getTokenedRequest (cb) {
  request({
    url: getUrl('frcsTkn'),
    headers: {
      'X-CSRF-Token': 'Fetch'
    },
    json: true
  }, function (err, res, body) {
    if (err) return cb(err)
    var cookie = res.headers &&
      res.headers['set-cookie'] &&
      res.headers['set-cookie'][0].split(';')[0]
    var tokenedRequest = request.defaults({
      headers: {
        'X-CSRF-Token': body.data.token,
        'Cookie': cookie
      },
      json: true
    })
    cb(null, tokenedRequest)
  })
}

/**
 * For a given location point and tolerance, authenticate the session for
 * making requests within the county of the location.
 */
function authenticateNearby (point, tolerance, cb) {
  getTokenedRequest(function (err, tokenedRequest) {
    if (err) return cb(err)
    tokenedRequest({
      url: getUrl('authenticate_nearby'),
      method: 'POST',
      form: {
        lon: point[0],
        lat: point[1],
        tolerance: tolerance
      }
    }, function (err, response, body) {
      if (err) return cb(err)
      var filter = body.data && body.data.user && body.data.user.filterPipe
      cb(null, filter, tokenedRequest)
    })
  })
}
