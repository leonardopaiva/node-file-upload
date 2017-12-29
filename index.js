const formidable = require('formidable');
const http = require('http');
const mime = require('mime');
const path = require('path');
const fs = require('fs');
const url = require('url');

http.createServer(function(req, res) {

  console.log('Requested URL: ', req.url);

  if (req.url === '/upload') {

    var form = formidable.IncomingForm();

    form.parse(req, function(err, params, files) {

      if (err) throw err;

      var filesKeys = Object.keys(files);
      if (filesKeys.length == 0) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          status: false,
          message: 'No file provided!'
        }));
        return;
      }

      var dirToSave = path.join(__dirname + '/tmp/');

      if (!fs.existsSync(dirToSave)) {
        fs.mkdirSync(dirToSave);
      }

      var oldPath = files[filesKeys[0]].path;
      var newPath = path.join(dirToSave + files[filesKeys[0]].name);

      fs.readFile(oldPath, function(err, data) {
        if (err) throw err;
        fs.writeFile(newPath, data, function(err){
          if (err) throw err;
          fs.unlink(oldPath, function(err) {
            if (err) throw err;
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
              status: true,
              message: 'File uploaded!'
            }));
          })
        })
      });

      //res.end('File upload');

    })


  } else if (req.url.indexOf('/photo/') > -1) {
    
    var requestedURL = url.parse(req.url).path;
    var imageName = requestedURL.substr(requestedURL.lastIndexOf('/') + 1);

    var filePath = path.join(__dirname + '/tmp/' + imageName);

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        status: false,
        message: 'File not found'
      }))
      return;
    }
    
    var image = fs.readFileSync(filePath);

    res.writeHead(200, {'Content-Type': mime.getType(filePath)});
    res.end(image, 'binary');

  } else {

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      status: false,
      message: 'Generic url...'
    }))

  }

  //res.end('Request end...');

}).listen(8080, function() {

  console.log('Server listening on port 8080...');

});