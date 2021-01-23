module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: "./src/index.ts",
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  target: 'node',
  output: {
    filename: "certassert.js",
    path: __dirname + '/dist',
    library: 'certassert',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  }
};
