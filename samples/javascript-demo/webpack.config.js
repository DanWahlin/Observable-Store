const path = require('path');

module.exports = {
  entry: './src/main.js',
  devtool: 'inline-source-map',
  resolve: {
    extensions: [ '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
};