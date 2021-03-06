'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var eslint = require('gulp-eslint');

var lint = ['index.js', 'utils.js', 'test.js'];

gulp.task('coverage', function() {
  return gulp.src('index.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('mocha', ['coverage'], function() {
  return gulp.src('test.js')
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports())
});

gulp.task('eslint', function() {
  return gulp.src(lint)
    .pipe(eslint())
});

gulp.task('default', ['mocha', 'eslint']);
