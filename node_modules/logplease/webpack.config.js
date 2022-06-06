const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  output: {
    libraryTarget: 'var',
    library: 'Logger',
    filename: './dist/logplease.min.js'
  },
  node: {
    console: false,
    process: 'mock'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: { warnings: false }
    })
  ],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: require.resolve('babel-preset-es2015'),
        plugins: require.resolve('babel-plugin-transform-runtime')
      }
    }]
  }
}
