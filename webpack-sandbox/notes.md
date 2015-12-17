Notes: on the tutorial at http://webpack.github.io/docs/tutorials/getting-started/#welcome

1) - something is broken - error 

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
