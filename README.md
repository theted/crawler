# Crawler 

This is a simple crawler, implementing some methods for fetching URL:s and parsing the retreived HTML using jQuery-like selectors. It is intended to be used as a part of a backend.


### TODO
- Implement the thing
- Add examples to the documentation 


------------------------------------
-----------


### `crawler#fetch`

Retreives the HTML of a given `url`

```js
crawler.fetch(url).then(function(html) {
  // now contains the HTML for the URL
  return html;
});
```
