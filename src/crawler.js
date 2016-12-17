var Promise = require('bluebird');
var request = require('request');
var userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36'; // default user-agent to use for requests
var headers = {'User-Agent': userAgent};

/*
 * fetch an URL, return the HTML body as a text string
 */
function fetchUrl(url) {
  return new Promise(function(resolve, reject) {
    request({url: url, headers: headers}, function(error, response, body) {
      if(error) reject(error);
      resolve(body);
    });
  });
}

module.exports = {
  fetchUrl: fetchUrl,
}
