module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://192.168.1.130',
        preserveHeaderKeyCase: true
      }
    }
  },
  assetsDir: 'static',
  productionSourceMap: false
}
