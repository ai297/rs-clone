const nodeExternals = require('webpack-node-externals');
const ESLintPlugin = require('eslint-webpack-plugin');
const paths = require('./paths');

module.exports = {
  mode: 'production',
  context: paths.server_dir,
  entry: {
    app: './index.ts',
  },
  output: {
    filename: '[name].js',
    path: paths.server_build_dir,
  },
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: paths.ts_config_path
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  externals: [nodeExternals()],
  plugins: [
    new ESLintPlugin({
      extensions: ['ts', 'js']
    }),
  ],
};
