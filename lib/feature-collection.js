var output = require('ndjson-cli/output')
var readline = require('readline')

process.stdout.write('{"type": "FeatureCollection", "features": [\n')

var started = false

readline.createInterface({
  input: process.stdin,
  output: null
}).on('line', function (line) {
  if (started) process.stdout.write(',')
  process.stdout.write(line + '\n')
  started = true
}).on('close', function () {
  process.stdout.write(']}\n')
})
