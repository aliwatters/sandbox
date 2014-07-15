'use strict';

var gulp = require('gulp');
var path = require('path');
var conf = {
  gwd : __dirname,
  // combine in gulp/conf.json
};

require('fs').readdirSync('./gulp').forEach(function(file) {
  if (path.extname(file) === '.js') {
    require('./gulp/' + file)(gulp, conf);
  }
});
