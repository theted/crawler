const Promise = require('bluebird')
const request = require('request')
const cheerio = require('cheerio')
const phantom = require('phantom')
const fs = require('fs')
const _ = require('lodash')
const helpers = require('../src/helpers')
const log = helpers.log
const userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36' // default user-agent to use for requests
const headers = { 'User-Agent': userAgent }

/*
 * fetch an URL, return the HTML body as a text string
 */
this.fetchUrl = fetchUrl = function (url, options) {
    return new Promise(function (resolve, reject) {
        request({ url: url, headers: headers }, (error, response, body) => {
            if (error) reject(error)
            resolve(body)
        })
    })
}

/*
 * fetch an URL using PhantomJS, evaluate javascript before returning HTML
 */
this.fetchUrlPhantom = fetchUrlPhantom = function (url, options) {
    return new Promise(function (resolve, reject) {
        log('Fetching URL using PhantomJS:', url)

        // handle default options
        options = options || {}
        options.wait = options.wait || 0

        if (options.wait) log('Waiting', options.wait, 'ms')

        phantom.create().then(function (ph) {
            ph.createPage().then(function (page) {
                page.open(url).then(function (status) {
                    setTimeout(function () {
                        page.evaluate(function () {
                            return document.getElementsByTagName('html')[0].outerHTML
                        }).then(function (html) {
                            log('Returning HTML')
                            ph.exit()
                            resolve(html)
                        })
                    }, options.wait)
                })
            })
        })
    })
}

// TODO: implement screenshot capabilities!

/*
 * wrapper function, using fetchUrl or fetchUrlPhantom
 * as needed, depending on if we want to evaluate
 * javascript or a waiting timeout is provided
 */
function fetch(url, options) {
    options = options || {}
    options.evaluateJavascript = options.evaluateJavascript || false // TODO: better parameter name
    options.wait = options.wait || 0

    return new Promise(function (resolve, reject) {
        this[(options.evaluateJavascript || options.wait) ? 'fetchUrlPhantom' : 'fetchUrl'](url, options).then(function (res) {
            resolve(res)
        })
    })
}

/**
 * Scrape url
 * ! do comments
 * 
 * @param {string} url
 * @param {string|array|object} pattern 
 * @param {object} options 
 * @returns {object} results (promise)
 */
function scrape(url, pattern, options) {
    options = options || {}

    return fetch(url, options).then((body) => {
        return parse(body, pattern)
    })
}

/*
 * download a remote file to a local path
 */
function fetchFile(remote, local) {
    return new Promise(function (resolve, reject) {
        log('Downloading file:', remote, '->', local)

        let file = fs.createWriteStream(local)
        let stream = request(remote)
        let total = stream.length
        let bytes = 0

        stream.on('data', function (chunk) {
            file.write(chunk)
            bytes += chunk.length
            log(bytes, 'bytes written (' + Math.ceil(bytes / total) + '%)')
        })

        stream.on('end', function () {
            log('Done writing to file:', local)
            resolve(local)
        })

        stream.on('error', (error) => {
            reject(error)
        })
    })
}

/*
 * parse a HTML string using an object of jQuery-like selectors
 * 
 * example patterns:
 * 'p'
 * ['p', 'a:href']
 * 'div.list > a:href'
 * {titleOfObj: 'img:src'}
 */
function parse(data, pattern, requiredSelector) {
    return new Promise(function (resolve, reject) {
        log('Parsing HTML')
        if (!requiredSelector) requiredSelector = 'body'
        let results = {}
        let $ = cheerio.load(data) // use cheerio for jQuery-like syntax
        if ($(requiredSelector).length < 1) resolve('error: did not found required selector')

        _.each(pattern, function (item, key) {
            let type = getType(item) // get item type for the current selector
            let itemResults = []

            $(type.val).each(function () {
                let itemRes = (type.type == 'text')
                    ? $(this).text()
                    : $(this).attr(type.type)

                itemRes = removeExtraWhitespace(itemRes)
                itemResults.push(itemRes)
            })
            results[key] = itemResults
        })

        // TODO:flatten object?
        resolve(results)
    })
}

function removeExtraWhitespace(str) {
    if (typeof str === 'undefined') return ''

    return str
        .replaceAll('\n\n', '')
        .replaceAll('\t\t', '')
        .replaceAll('        ', '')
        .replaceAll('\n    ', '')
        .replaceAll('\n\t\n', '')
        .replaceAll('\n\t', '')
        .replaceAll('    \n', '')
        .replaceAll('    ', '') // maybe overkill
}

function getType(val) {
    let type = 'text' // default type

    if (val.indexOf(':') > 0) {
        let p = val.split(':')
        val = p[0]
        type = p[1]
    }

    return {
        type: type,
        val: val
    }
}

// moar helper functions ...

String.prototype.replaceAll = function (find, replace) {
    let str = this
    return str.replace(new RegExp(find, 'g'), replace)
}

function firstRow(str, expr) {
    let parts = str.split(expr)
    if (parts.length < 1) parts = [str]
    return parts[0]
}

module.exports = {
    fetch: fetch,
    fetchUrl: fetchUrl,
    fetchUrlPhantom: fetchUrlPhantom,
    fetchFile: fetchFile,
    parse: parse,
    scrape: scrape
}
