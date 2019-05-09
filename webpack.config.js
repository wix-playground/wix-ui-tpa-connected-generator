const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const NpmDtsPlugin = require('npm-dts-webpack-plugin')

const exportedConfig = {
  entry: __dirname + '/index.ts',
  target: 'node',
  devtool: 'source-map',
  optimization: {
    minimize: true,
  },
  mode: 'production',
  plugins: [
    new NpmDtsPlugin({
      logLevel: 'debug',
    }),
  ],
  node: {
    __dirname: true,
  },
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.js'],
  },
  output: {
    path: __dirname + '/dist/logic',
    filename: 'index.js',
    sourceMapFilename: 'index.js.map',
    libraryTarget: 'umd',
  },
  resolveLoader: {
    modules: [__dirname + '/node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: __dirname + '/tsconfig.json',
            },
          },
        ],
      },
    ],
  },
}

module.exports = exportedConfig
