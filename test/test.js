var Promise = require('bluebird');
var _ = require('lodash');
var crawler = require('../src/crawler');
var config = require('./testConfig');
var helpers = require('../src/helpers');
var log = helpers.log;

log('Performing Crawler tests...');


// fetch HTML of an URL
// crawler.fetchUrl(config.url).then(log);

var options = {
  wait: 3000,
  evaluateJavascript: true, // TODO: better paramater name
}


// fech an URL, then parse the HTML output
crawler.fetch(config.url, options)
  .then(function(html) {
    return crawler.parse(html, config.selectors);
  })
  .then(log) // output parsed HTML object   
;


// fetch an image and save it locally 
crawler.fetchFile(config.fileRemote, config.fileLocal).then(log);
