var webpack = require('webpack');
var path = require('path');

// Detect environment
var isProduction = process.env.NODE_ENV === 'production';

// Create config
var config = {
  entry: {
    'demo/dist/main.js': './demo/src/main.js',
    'demo/dist/main-simple.js': './demo/src/main-simple.js',
    'demo/dist/main-simple_as.js': './demo/src/main-simple_as.js',
    'demo/dist/main-simple_h5.js': './demo/src/main-simple_h5.js',
    'demo/dist/main-simple_ilsa.js': './demo/src/main-simple_ilsa.js',
    'demo/dist/version.js': './demo/src/version.js',
  },
  output: {
    path: __dirname,
    filename: '[name]'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
          plugins: ['transform-object-assign']
        }
      }
    ]
  },

  plugins: [],

  devtool: isProduction ? undefined : 'eval'
};

if (isProduction) {
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  );
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      report: 'min',
      compress: true,
      preserveComments: false,
      mangle: true
    })
  );
}

module.exports = config;
