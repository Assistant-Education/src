const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/js/app.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.min.js'
  },
  module: {
    loaders: [
      { test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      { test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: { presets:['es2015', 'react'] }
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin({
      parallel: {
        cache: true,
        workers: 2 // for e.g
      },
      output: {
        comments: false,
        beautify: false,
      }
    })
  ]
};
