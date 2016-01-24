var fs = require('fs')
var path = require('path')
var chalk = require('chalk')

var webRoot = __dirname
var uppyRoot = path.dirname(__dirname)

var configPath = webRoot + '/_config.yml'
var config = fs.readFileSync(configPath, 'utf-8')
var version = require(uppyRoot + '/package.json').version

// Inject current Uppy version and sizes in website's _config.yml
var sizes = {}
var locations = {
  min: uppyRoot + '/dist/uppy.js',
  gz: uppyRoot + '/dist/uppy.js',
  dev: uppyRoot + '/dist/uppy.js',
  css: uppyRoot + '/dist/uppy.css'
}
// @todo: ^-- Refer to actual minified builds in dist:

for (var file in locations) {
  var filesize = fs.statSync(locations[file], 'utf-8').size
  sizes[file] = (filesize / 1024).toFixed(2)
}

fs.writeFileSync(
  configPath,
  config
    .replace(/uppy_version: .*/, 'uppy_version: ' + version)
    .replace(/uppy_(\w+)_size:.*/g, function (m, p1) {
      return 'uppy_' + p1 + '_size: "' + (sizes[p1] || 99999) + '"'
    })
)

var exec = require('child_process').exec
exec('cp -fR ' + uppyRoot + '/dist/ ' + webRoot + '/themes/uppy/source/uppy', function (error, stdout, stderr) {
  if (error) {
    console.error(
      chalk.red('x failed to inject: '),
      chalk.dim('uppy umd build into site, because: ' + error)
    )
    return
  }
  console.info(chalk.green('✓ injected: '), chalk.dim('uppy umd build into site'))
})
