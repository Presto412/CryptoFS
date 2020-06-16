module.exports = {
  entry: {
    list: './src/public/js/list.js',
    mainpage: './src/public/js/mainpage.js',
    nav: './src/public/js/nav.js',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js'],
  },
  output: {
    path: `${__dirname}/src/public/js/dist`,
    publicPath: '/',
    filename: '[name].bundle.js',
  },
  devServer: {
    contentBase: './dist',
  },
};
