"use strict";

var fs = require('fs');

var path = require('path');
var glob = require('glob');
var mold = require('mold-source-map');
var gulp = require('gulp');
var gutil = require('gulp-util');
//var buster = require('gulp-buster');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
//var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
//var jshint = require('gulp-jshint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('clean', function (cb) {
  gulp.src('build', {read: false})
    .pipe(clean())
    .on('error', gutil.log);

  cb();
});


gulp.task('browserify', function(cb) {

  // var production = gutil.env.type === 'production';

  var b = browserify();
  b.add ('./index.js');

  b.bundle({ debug : true, basedir: '.' })
    .pipe(mold.transformSourcesRelativeTo(__dirname)) // fixes https://github.com/substack/node-browserify/issues/681
    .pipe(source('index.js'))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('build/js'))
    .on('error', gutil.log);

  cb();
});


gulp.task('minify', function(cb) {
  gulp.src('build/js/*.js')
    .pipe(uglify())
    .pipe(rename(function (path) {
              if(path.extname === '.js') {
                path.basename += '.min';
              }
            }))
    .pipe(gulp.dest('build/js'));

  cb();
});

gulp.task('lint', function(cb) {
  var res = gulp.src(['src/**/*.js']) // excludes vendor, node_modules
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .on('error', gutil.log);

  cb();
});


gulp.task('hash', function(cb) {
	buster.config({algo : 'md5', length: 7});

  gulp.src('build/js/*.min.js')
    .pipe(buster('mapping.json'))
    .pipe(gulp.dest('build'))

  cb();
});


gulp.task('linkup', ['hash'], function(cb) {

  var map = require('./build/mapping.json');
  var files = glob.sync('build/js/*.min.js');
  console.log(files);

  if(!fs.existsSync("build/dist")) {
    fs.mkdirSync("build/dist", '0755', function(err){
      if (err) {
        console.log(err);
        return err;
      }
    });
  }

  files.forEach(function (file) {
    var hash = map[file] || '0';
    var name = file.replace(/\.min\.js$/, '-' + hash + '.min.js').replace(/build\/js\//,'build/dist/');

    console.log(hash, name);
    gulp.src(file, {read:false})
      .pipe(symlink(name));
  });

  cb();
});


gulp.task('default', ['lint', 'clean', 'browserify', 'minify', 'hash', 'linkup']);
