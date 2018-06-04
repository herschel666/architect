let parse = require('@architect/parser')
let url = require('url')
let send = require('send')
let exists = require('path-exists').sync
let path = require('path')
let fs = require('fs')

module.exports = function static(req, res, next) {

  // get the file exension
  let allowed = ['svg', 'gif', 'jpg', 'html', 'css', 'js']
  let pathToFile = url.parse(req.url).pathname
  let bits = pathToFile.split('.')
  let last = bits[bits.length - 1] // the file extension

  // parse .arc
  let pathToArc = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(pathToArc).toString()
  let arc = parse(raw)

  let noFile = !allowed.includes(last)
  let noStatic = !exists(path.join(process.cwd(), '.static'))
  let notInterested = (last === 'js' && arc.hasOwnProperty('js')) || (last === 'css' && arc.hasOwnProperty('css'))

  if (noFile) {
    // only allowed file types
    next()
  }
  else if (noStatic) {
    // if there's no static skip
    next()
  }
  else if (notInterested) {
    // js or css are defined in .arc so skip
    next()
  }
  else {
    function error (err) {
      res.statusCode = err.status || 500
      res.end(err.message)
    }

    // custom headers
    function headers (/*res, path, stat*/) {
      // serve all files for download
      //res.setHeader('Content-Disposition', 'attachment')
    }

    // custom directory handling logic
    function redirect () {
      res.statusCode = 301
      res.setHeader('Location', req.url + '/')
      res.end('\n')
    }

   send(req, pathToFile, {root: '.static'})
   .on('error', error)
   .on('directory', redirect)
   .on('headers', headers)
   .pipe(res)
  }
}