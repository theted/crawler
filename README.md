# Crawler 

This is a simple crawler, implementing some methods for fetching URL:s and parsing the retreived HTML using jQuery-like selectors. It is intended to be used as a part of a backend.


## Features
- use jQuery selector syntax to get elements, powered by cheerio
- Parallel processing of URLs
- Ability to follow URLs


## Installation 
Clone this repo (currently not on NPM). Then include it:

```
var crawler = require('./crawler/crawler.js');
```


## Methods


### ```crawler.fetch(url)```

Retreives the HTML of a given `url`

```js
crawler.fetch(url).then(function(html) {
  // now contains the HTML for the URL
  return html;
});
```


### `crawler.scrape(url, pattern)`
Retreive an URL, parse it using given rules. This is a shorthand for crawler.fetch followed by crawler.parse

url, pattern, options 


## Examples
[TODO]
