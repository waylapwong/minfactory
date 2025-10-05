module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-spec-reporter')
    ],
    client: {
      jasmine: {}
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/client'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }]
    },
    reporters: ['spec'],
    browsers: ['ChromeHeadless'],
    restartOnFileChange: true,
    specReporter: {
      suppressSkipped: false,
      showSpecTiming: true,
      suppressErrorSummary: false
    }
  });
};
