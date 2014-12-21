gulp = require 'gulp'
coffee = require 'gulp-coffee'
mocha = require 'gulp-mocha'
clean = require 'gulp-clean'
karma = require('karma').server
markdown = require 'gulp-markdown'
watch = require 'gulp-watch'
sourcemaps = require 'gulp-sourcemaps'
coffeelint = require 'gulp-coffeelint'
uglify = require 'gulp-uglify'
concat = require 'gulp-concat'
rename = require 'gulp-rename'

gulp.task 'clean', ->
  gulp.src ['./.tmp', './dist', './karma_html', 'coverage']
  .pipe clean()

gulp.task 'coffee', ['lint', 'clean'], ->
  gulp.src './src/*.coffee'
  .pipe sourcemaps.init()
  .pipe coffee bare: true
  .pipe sourcemaps.write()
  .pipe gulp.dest './dist/'

gulp.task 'coffeeTest', ['clean'], ->
  gulp.src './test/*.coffee'
  .pipe sourcemaps.init()
  .pipe coffee bare: true
  .pipe sourcemaps.write()
  .pipe gulp.dest './.tmp/test/'

gulp.task 'minify', ['coffee'], ->
  gulp.src './dist/*.js'
  .pipe concat 'backbone.stateful.js'
  .pipe gulp.dest './dist/'
  .pipe uglify()
  .pipe rename 'backbone.stateful.min.js'
  .pipe gulp.dest './dist/'

gulp.task 'lint', [], ->
  gulp.src ['./src/*.coffee', './gulpfile.coffee']
  .pipe coffeelint()
  .pipe coffeelint.reporter()

gulp.task 'test', ['clean', 'coffee', 'coffeeTest'], (done)->
  karma.start {
    configFile: 'karma.conf.coffee',
    singleRun: true
  }, done

gulp.task 'doc', ['coffee'], ->
  gulp.src './doc/**/*.md'
  .pipe markdown
    highlight: (code, lang, callback)->
      require('pygmentize-bundled')(
        {lang: lang, format: 'html'},
        code,
        (err, result)-> callback err,
          result.toString())
  .pipe gulp.dest './dist/doc/'

gulp.task 'watchDoc', ->
  gulp.watch('./doc/**/*.md', ['doc'])


gulp.task 'default', ['coffee', 'minify', 'test', 'doc']
