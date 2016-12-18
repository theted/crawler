var Promise = require('bluebird');
var _ = require('lodash');
var crawler = require('../src/crawler');
var config = require('./testConfig');
var helpers = require('../src/helpers');
var log = helpers.log;

log('Performing Crawler tests...');


// fetch HTML of an URL
// crawler.fetchUrl(config.url).then(log);


// fech an URL, then parse the HTML output
crawler
  
  // first get the HTML from an URL
  // .fetchUrl(config.url) // get raw HTML 
  // .fetchUrlPhantom(config.url) // evaluate javascript
  .fetchUrlPhantom(config.url, {wait: 3000}) // wait 3 s, evaluate javascript
  // .then(log) // output HTML
  
  // parse HTML
  .then(function(html) {
    return crawler.parse(html, config.selectors);
  })
  .then(log) // output parsed HTML object   
;


// fetch an image and save it locally 
crawler.fetchFile(config.fileRemote, config.fileLocal).then(log);
