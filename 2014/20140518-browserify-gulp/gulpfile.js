'use strict';

var path = require('path');
var fs = require('fs');
var glob = require('glob');
var gulp = require('gulp');
var gutil = require('gulp-util');
var buster = require('gulp-buster');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var browserify = require('browserify');
var filesize = require('gulp-filesize');
var less = require('gulp-less');
var changed = require('gulp-changed');
var watch = require('gulp-watch');
var symlink = require('gulp-symlink');
var streamqueue = require('streamqueue');

gulp.task('clean', function () {
  return gulp.src('build', {read: false})
    .pipe(clean());
});


gulp.task('vendor', function() {
  return gulp.src('vendor/*.js')
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('build'))
    .pipe(filesize())
    .pipe(uglify())
    .pipe(rename('vendor.min.js'))
    .pipe(gulp.dest('build'))
    .pipe(filesize())
    .on('error', gutil.log);
});


gulp.task('css', function () {
  return gulp.src('less/**/*.less')
    .pipe(changed('build/css'))
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('build/css'))
    .on('error', gutil.log);
});


gulp.task('css:watch', function () {
  watch({
    glob: 'less/**/*.less',
    emit: 'one',
    emitOnGlob: false
  }, function(files) {
    return files
      .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
      }))
      .pipe(gulp.dest('build/css'))
      .on('error', gutil.log);
  });
});


gulp.task('browserify', function() {
  var production = gutil.env.type === 'production';

  gulp.src(['index.js'], {read: false})

    // Browserify, and add source maps if this isn't a production build
    .pipe(browserify({
      debug: !production,
      extensions: ['.jsx']
    }))

    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(filesize())
	  .pipe(uglify())
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(filesize());
});




gulp.task('hash', function(file) {
	buster.config({algo : 'md5', length: 6});
	return gulp.src(file).buster();

});


gulp.task('lint', function() {
  return gulp.src('./*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('hash', function() {
	buster.config({algo : 'md5', length: 6});

  return gulp.src([
    'build/**/*.min.js',
    'css/*.css'
  ])
  .pipe(buster('mapping.json'))
  .pipe(gulp.dest('build/js'));

});


gulp.task('linkup', function() {

  var map = require('./build/js/mapping.json');
  var stream = streamqueue({ objectMode: true });

  var files = glob.sync('build/js/**/*.min.js');

  return files.forEach(function (file) {
    var hash = map[file] || '0';
    var name = file.replace(/\.min\.js$/, '-' + hash + '.min.js');
    stream.queue(
      gulp.src(file, {read:false})
        .pipe(symlink(name))
    )
  });

});




// doesn't run in series ... use gulp lint; gulp clean; gulp browserify; gulp hash; gulp linkup;
gulp.task('default', ['lint', 'clean', 'browserify', 'hash', 'linkup']);
