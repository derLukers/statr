# Karma configuration
# Generated on Fri Nov 28 2014 16:23:22 GMT+0100 (CET)

module.exports = (config) ->
  config.set

    basePath: ''

    frameworks: ['jasmine', 'requirejs']

    files: [
      './test-main.coffee',
      {pattern: './dist/*.js', included: false},
      {pattern: './test/*.coffee', included: false}
      {pattern: './bower_components/*/*.js', included: false}
      {pattern: './bower_components/backbone.marionette/lib/*.js', included: false}
      {pattern: './bower_components/jquery/dist/jquery.js', included: false}
    ]

    reporters: ['progress', 'dots', 'html']

    port: 9876

    colors: true

    logLevel: config.LOG_INFO

    autoWatch: true

    browsers: ['Chrome']

    singleRun: false

    preprocessors:
      '**/*.coffee': ['coffee']
