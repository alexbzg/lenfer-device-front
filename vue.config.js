module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://192.168.1.195',
        preserveHeaderKeyCase: true
      }
    }
  },
  assetsDir: 'static'
}
