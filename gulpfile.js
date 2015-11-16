/* globals require */

'use strict';

var concat = require('gulp-concat');
var gulp = require('gulp');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var rimraf = require('rimraf');
var rename = require('gulp-rename');
var merge = require('merge2');

var tsProject = ts.createProject({
    declaration: true,
    noExternalResolve: true,
    noImplicitAny: false,
    removeComments: false,
    target: 'ES5',
    emitDecoratorMetadata: false
});

gulp.task('typescript', ['clean'], function() {
    var tsResult = gulp.src(['src/*.module.ts', 'src/*.ts', 'typings/**/*.d.ts'])
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

    var jsResult = tsResult.js
        .pipe(concat('ui-router-metatags.js'))
        .pipe(ngAnnotate({
            gulpWarnings: true
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'));

    var dtsResult = tsResult.dts
        .pipe(gulp.dest('dist/'));

    return merge([
        jsResult,
        dtsResult
    ]);
});

gulp.task('usemin', ['typescript'], function() {
    return gulp.src('dist/*.js')
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));

});

gulp.task('clean', function(cb) {
    rimraf('dist', cb);
});

gulp.task('default', function() {
    gulp.start('usemin');
});
