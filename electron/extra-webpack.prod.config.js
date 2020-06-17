module.exports = {
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'node-loader-relative',
        options: {
          basePath: __dirname,
        },
      },
    ],
  },
};
