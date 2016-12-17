var Promise = require('bluebird');
var crawler = require('../src/crawler');
var config = require('./testConfig');
var helpers = require('../src/helpers');
var log = helpers.log;

log('Performing Crawler tests...');

// fetch HTML of an URL
crawler.fetchUrl(config.url).then(log);
