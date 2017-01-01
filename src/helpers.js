var Promise = require('bluebird');
var fs = require('fs');
var debug = true;

function log() {
  if(debug) {
    // console.log(content);
    var args = Array.prototype.slice.call(arguments);
    var str = '';
      
    args.forEach(function (arg) {
      switch(typeof arg) {
        default:
          console.log('=>', 'Unknown type:', typeof arg);
        break;

        case 'string':
        case 'number':
          str += arg + ' ';
        break;

        case 'object':
        case 'array':
          // str += JSON.stringify(arg); // compressed
          str += JSON.stringify(arg, null, 2); // beauty
        break;
      }        
    });

    console.log(str);
  }

  return str;
  // return content;
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
