var fs = require('fs');

module.exports = function(config) {
  config.set({
    browsers: process.env.BROWSER ? [process.env.BROWSER] : ['PhantomJS'],
    frameworks: [
      'fixture',
      'browserify',
      'chai',
      'mocha',
      'source-map-support'
    ],
    files: [
      'test/*.spec.js',
      'test/fixtures/*.html'
    ],
    reporters: ['progress', 'coverage'].concat(
      (process.env.COVERALLS_REPO_TOKEN ? ['coveralls'] : [])),
    preprocessors: {
      'test/*.spec.js': ['browserify'],
      'test/fixtures/*.html': ['html2js']
    },
    browserify: {
      debug: true,
      transform: ['babelify', 'browserify-istanbul']
    },
    coverageReporter: {
      reporters: [
        {type: 'lcovonly'},
        {type: 'text'}
      ]
    },
    customLaunchers: {
      'SL_Chrome': {
        base: 'SauceLabs',
        browserName: 'chrome'
      },
      'SL_Firefox': {
        base: 'SauceLabs',
        browserName: 'firefox'
      },
      "SL_Safari_5": {
        base: "SauceLabs",
        browserName: "Safari",
        platform: "OS X 10.6",
        version: "5"
      },
      "SL_Safari_6": {
        base: "SauceLabs",
        browserName: "Safari",
        platform: "OS X 10.8",
        version: "6"
      },
      "SL_Safari_7": {
        base: "SauceLabs",
        browserName: "Safari",
        platform: "OS X 10.9",
        version: "7"
      },
      "SL_Safari_8": {
        base: "SauceLabs",
        browserName: "Safari",
        platform: "OS X 10.10",
        version: "8"
      },
      'SL_IE_9': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '9'
      },
      'SL_IE_10': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '10'
      },
      'SL_IE_11': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '11'
      }
    },
    sauceLabs: {
      testName: 'DOM Seek'
    },
    singleRun: true
  });
};
