var Promise = require('bluebird');
var fs = require('fs');
var debug = true;

function log(content) {
  if(debug) console.log(content);
  return content;
}

function readFile(file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(file, 'utf8', function(err, data) {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function writeFile(string, file) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(file, string, function(err) {
      if(err) { reject(err); }
      resolve(file);
    }); 
  });
}

module.exports = {
  log: log,
  readFile: readFile,
  writeFile: writeFile,
};
