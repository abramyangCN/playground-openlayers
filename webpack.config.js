const { resolve } = require('path');
const httpWebpackPlugin = require('html-webpack-plugin');

const commonCssLoader = [
  'style-loader',
  { loader: 'css-loader', options: { importLoaders: 1 } },
];

module.exports = {
  entry: './main.js',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [...commonCssLoader],
      },
    ],
  },
  plugins: [new httpWebpackPlugin({ template: './index.html' })],
  devServer: {
    contentBase: resolve(__dirname, 'dist'),
    port: 3000,
    host: 'localhost',
    watchContentBase: true,
    watchOptions: {
      // 忽略文件
      ignored: /node_modules/,
    },
    compress: true,
    hot: true,
  },
  devtool: 'eval-source-map',
  mode: 'development',
};
