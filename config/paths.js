const path = require('path');

module.exports = {
  app_dir: path.resolve(__dirname, '../src/client'),
  build_dir: path.resolve(__dirname, '../dist/public'),
  public_dir: path.resolve(__dirname, '../public'),
  server_dir: path.resolve(__dirname, '../src/server'),
  server_build_dir: path.resolve(__dirname, '../dist'),
  ts_config_path: path.resolve(__dirname, './tsconfig.json'),
};
