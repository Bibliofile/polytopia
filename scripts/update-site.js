// @ts-check

const { publish } = require('gh-pages')

publish('build', {
  message: 'Update site'
}, console.error)
