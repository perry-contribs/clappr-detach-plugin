const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'clappr-detach-plugin.js',
    library: 'ClapprDetachPlugin',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      {
        test: /src\/.+.js$/,
        loader: 'babel',
        query: {
          compact: true,
        },
      },
      {
        test: /\.css$/,
        loader: 'css',
      },
      {
        test: /\.(html|svg)$/,
        loader: 'html?minimize=true',
      },
    ],
  },
  resolve: {
    extensions: ['', '.js'],
  },
  externals: {
    clappr: {
      commonjs: 'clappr',
      commonjs2: 'clappr',
      amd: 'clappr',
      root: 'Clappr',
    },
  },
}
