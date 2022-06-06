module.exports = {
  entry: './example/example.js',
  output: {
    filename: './example/bundle.js'
  },
  node: {
    console: false,
    process: 'mock'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      }
    }]
  }
}
