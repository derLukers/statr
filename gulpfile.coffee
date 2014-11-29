gulp = require 'gulp'
coffee = require 'gulp-coffee'
mocha = require 'gulp-mocha'
clean = require 'gulp-clean'
karma = require('karma').server

gulp.task 'clean', ->
  gulp.src ['./.tmp', './dist']
  .pipe clean()

gulp.task 'coffee', ['clean'], ->
  gulp.src './src/*.coffee'
  .pipe coffee bare: true
  .pipe gulp.dest './dist/'

gulp.task 'coffeeTest', ['clean'], ->
  gulp.src './test/*.coffee'
  .pipe coffee bare: true
  .pipe gulp.dest './.tmp/test/'

gulp.task 'test', ['coffee', 'coffeeTest'], (done)->
  karma.start {
    configFile: 'karma.conf.coffee',
    singleRun: true
  }, done

gulp.task 'default', ['coffee', 'test']
