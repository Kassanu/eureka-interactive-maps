process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  publicPath: '/',
  css: {
    extract: true
  }
}