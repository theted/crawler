var Promise = require('bluebird');
var request = require('request');
var cheerio = require('cheerio');
var phantom = require('phantom');
var fs = require('fs');
var _ = require('lodash');
var helpers = require('../src/helpers');
var log = helpers.log;
var userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36'; // default user-agent to use for requests
var headers = {'User-Agent': userAgent};

/*
 * fetch an URL, return the HTML body as a text string
 */
this.fetchUrl = fetchUrl = function(url, options) {
  return new Promise(function(resolve, reject) {
    request({url: url, headers: headers}, function(error, response, body) {
      if(error) reject(error);
      resolve(body);
    });
  });
}

/*
 * fetch an URL using PhantomJS, evaluate javascript before returning HTML
 */
this.fetchUrlPhantom = fetchUrlPhantom = function(url, options) {
  return new Promise(function(resolve, reject) {
    log('Fetching URL using PhantomJS:', url);
    
    // handle default options
    options = options || {};
    options.wait = options.wait || 0;
  
    if(options.wait) log('Waiting', options.wait, 'ms');

    phantom.create().then(function(ph) {
      ph.createPage().then(function(page) {
        page.open(url).then(function(status) {
          setTimeout(function() {
            page.evaluate(function() {
              return document.getElementsByTagName('html')[0].outerHTML;
            }).then(function(html) {
              log('Returning HTML');
              ph.exit();
              resolve(html);
            });
          }, options.wait);
        })
      });
    });
  });
}

/*
 * wrapper function, using fetchUrl or fetchUrlPhantom
 * as needed, depending on if we want to evaluate 
 * javascript or a waiting timeout is provided
 */
function fetch(url, options) {
  options = options || {};
  options.evaluateJavascript = options.evaluateJavascript || false; // TODO: better parameter name
  options.wait = options.wait || 0;

  return new Promise(function(resolve, reject) {
    this[(options.evaluateJavascript || options.wait) ? 'fetchUrlPhantom' : 'fetchUrl'](url, options).then(function(res) {
      resolve(res);
    });
  });
}

/*
 * wrapper function, combining fetch and parse
 */
function scrape(url, pattern, options) {
  options = options || {};
  return fetch(url, options).then(function(body) {
    return parse(body, pattern);
  });
}

/*
 * download a remote file to a local path
 */
function fetchFile(remote, local) {
  return new Promise(function(resolve, reject) {
    log('Downloading file:', remote, '...');

    var file = fs.createWriteStream(local);
    var rem = request(remote);
    var total = rem.length;
    var bytes = 0;

    rem.on('data', function(chunk) {
      file.write(chunk);
      bytes += chunk.length;
      log(bytes, 'bytes written');
    });

    rem.on('end', function(){
      log('Done writing to file:', local);
      resolve(local);
    });
  });
}

/*
 * parse a HTML string using an object of jQuery-like selectors
 */
function parse(data, pattern, requiredSelector) {
  return new Promise(function(resolve, reject) {
    log('Parsing HTML');
    if(!requiredSelector) requiredSelector = 'body';
    var results = {};
    var $ = cheerio.load(data); // use cheerio for jQuery-like syntax
    if($(requiredSelector).length < 1) resolve('error: did not found required selector');
    _.each(pattern, function(item, key) {
      var type = getType(item); // get item type for the current selector
      var itemResults = [];
      $(type.val).each(function() {
        itemResults.push((type.type == "text")
          ? $(this).text()
          : $(this).attr(type.type)
        );
      });
      results[key] = itemResults;
    });
    resolve(results);
  });
}

function getType(val) {
  var type = 'text'; // default type

  if(val.indexOf(':') > 0) {
    var p = val.split(':');
    val   = p[0];
    type  = p[1];
  }

  return {
    type: type,
    val: val
  };
}


module.exports = {
  fetch: fetch,
  fetchUrl: fetchUrl,
  fetchUrlPhantom: fetchUrlPhantom,
  fetchFile: fetchFile,
  parse: parse,
  scrape: scrape,
}
