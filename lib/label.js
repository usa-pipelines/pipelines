var polyLabel = require('polylabel')
var meta = require('@turf/meta')
var area = require('@turf/area').default

module.exports = label

/**
 * Get a point inside the largest of the polygons in each MultiPolygon
 * (the centroid or center of mass could sit outside the polygon)
 */
function label (feature) {
  var coords
  var prevSize = 0

  meta.flattenEach(feature, function (f) {
    var size = area(f)
    if (size > prevSize) coords = polyLabel(f.geometry.coordinates, 0.0001)
    prevSize = size
  })
  return coords
}
