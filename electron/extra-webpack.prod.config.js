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
  resolve: {
    alias: {
      ws: 'node_modules/ws/index.js',
    },
    extensions: ['.node'],
  },
};
