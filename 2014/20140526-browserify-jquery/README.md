## Getting browserify and jquery to play nice.

### Goals

1) require jquery after installing via package json

2) extend jquery with a "hello world"

3) have that extension available to inline scripts

### To enable source maps

$ browserify -d app.js > dist/bundle.js

Note: https://github.com/substack/node-browserify/issues/681

TODO : add in basic gulp files with mold-source-map fix.
