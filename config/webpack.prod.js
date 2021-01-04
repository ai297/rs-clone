const merge = require('webpack-merge');
const ESLintPlugin = require('eslint-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  plugins: [
    new ESLintPlugin({
      extensions: ['ts', 'js']
    }),
  ],
});
