var meta = require('@turf/meta')
var cheapRuler = require('cheap-ruler')

/**
 * Calculate the maximum distance between a point and any point in a polygon
 * (calculates the smallest enclosing circle centered on the point)
 * Not precise, uses cheap ruler with about a 0.1% error at the scales we use
 */
module.exports = function maxDistance (point, polygon) {
  return meta.coordReduce(polygon, function (prev, coords) {
    var ruler = cheapRuler(point[1], 'miles')
    return Math.max(ruler.distance(point, coords), prev)
  }, 0) * 1.02 // Add 2% just to make sure we don't miss anything
}
