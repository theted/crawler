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

// get base name from an URL
function getHost(url) {
  return url.replace(/^((\w+:)?\/\/[^\/]+\/?).*$/,'$1');
}

// get last part of an URL - ie. fileName or URI part
function lastPart(url) {
  return removeTrailingSlash(url).split('/').pop();
}

function removeTrailingSlash(url) {
  if(url.substr(url.length - 1) == '/') {
    url = url.substring(0, url.length - 1);
  }
  return url;
}

// sanitize an URL from common mistakes
function sanitizeUrl(url, baseUrl) {
  if(url.indexOf(baseUrl) == -1 && url.indexOf('//') == -1) { url = baseUrl + url; }
  return url;
}

function validateUrl(url) {
  return true;
}

// remove redundant white space - tabs, newlines, 
// carriage & multiple spaces from a string
function sanitizeString(string) {
  string = string.replace(/\s\s+/g, ' '); // removes multiple occurencies of whitespaces, might be too agressive..
  // string = string.replace(/  +/g, ' '); // same as above, but only spaces
  string = string.trim();
  return string;
}

// sanitize an array
function sanitizeArray(array) {
  _.each(array,function(value, key) {
    if(value instanceof Array || value.isArray) {
      _.each(value, function(val, key) {
        value[key] = sanitizeString(val);
      });
    } else {
      array[key] = sanitizeString(value);
    }
  });
  return array;
}

// parse an array, perform callback function for each key 
// as defined in functions object
function parseArray(array, functions) {
  _.each(array, function(item, key) { // loop through each item in array
    if(key in functions) { // do we have a matching function for key? 
      array[key] = functions[key](item); // do the matching for the element, callback function determines what is returned here
    }
  });
  return array;
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
