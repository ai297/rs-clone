const merge = require('webpack-merge');
const common = require('./webpack.common');
const paths = require('./paths');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    contentBase: paths.public_dir,
    open: true,
    compress: true,
    hot: true,
    port: 8080,
    proxy: [{
      context: ['/api', '/hub'],
      target: 'http://localhost:3000',
      changeOrigin: true,
    }],
  },
});
