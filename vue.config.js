module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://192.168.1.103',
        preserveHeaderKeyCase: true
      }
    }
  },
  assetsDir: 'static'
}
