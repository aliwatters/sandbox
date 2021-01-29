# Webpack Sandbox

Notes: on the tutorial at http://webpack.github.io/docs/tutorials/getting-started/#welcome

## 1) - something is broken - error 

```
ali@jessie:~/git/sandbox/webpack-sandbox$ webpack
Hash: 0167c678f0974a913e86
Version: webpack 1.12.9
Time: 56ms
    Asset     Size  Chunks             Chunk Names
bundle.js  1.71 kB       0  [emitted]  main
   [0] ./entry.js 65 bytes {0} [built] [1 error]
   [1] ./content.js 46 bytes {0} [built]

ERROR in ./entry.js
Module not found: Error: Cannot resolve module 'style' in /home/www/git/sandbox/webpack-sandbox
 @ ./entry.js 1:0-22
```

See: https://github.com/webpack/webpack/issues/1130 (would be nice if cause of the issue was fixed)

Fix for that error: ```npm i --save-dev style-loader```


(acutally my FAULT! - missed the prerequisite command!)
```npm install css-loader style-loader ```


## 2) Next set of errors 

```
ERROR in ./~/css-loader!./style.css
Module build failed: ReferenceError: Promise is not defined
    at LazyResult.async (/home/www/git/sandbox/webpack-sandbox/node_modules/css-loader/node_modules/postcss/lib/lazy-result.js:157:31)
    at LazyResult.then (/home/www/git/sandbox/webpack-sandbox/node_modules/css-loader/node_modules/postcss/lib/lazy-result.js:79:21)
    at processCss (/home/www/git/sandbox/webpack-sandbox/node_modules/css-loader/lib/processCss.js:181:5)
    at Object.module.exports (/home/www/git/sandbox/webpack-sandbox/node_modules/css-loader/lib/loader.js:24:2)
 @ ./style.css 4:14-73
```

this does feel node v5 vs v0.10.38 related - installing nvm and switching to v5.

Aside: 
```
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
source ~/.bashrc 
nvm install v5.1
```


```
ali@jessie:~/git/sandbox/webpack-sandbox$ nvm use 5.1
Now using node v5.1.1 (npm v3.3.12)
ali@jessie:~/git/sandbox/webpack-sandbox$ npm i
npm WARN EPACKAGEJSON webpack-sandbox@1.0.0 No repository field.
ali@jessie:~/git/sandbox/webpack-sandbox$ webpack 
Hash: 39dc476d8f501833aae3
Version: webpack 1.12.9
Time: 534ms
    Asset     Size  Chunks             Chunk Names
bundle.js  11.8 kB       0  [emitted]  main
   [0] ./entry.js 65 bytes {0} [built]
   [5] ./content.js 46 bytes {0} [built]
    + 4 hidden modules
```

ok - back on track :) -- I'll update the wiki in webpack make that a little clearer.


## 3) last thing - to get the dev server working as expected - install globally

```
npm i webpack -g
npm i webpack-dev-server -g
webpack-dev-server --progress --colors
```
