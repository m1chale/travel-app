const path = require("path");
const webpack = require("webpack");
const htmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/client/index.js",
  mode: "development",
  devtool: "source-map",
  module: {
    rules: [],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: "./src/client/index.html",
      filename: "./index.html",
    }),
  ],
  output: {
    clean: true,
    libraryTarget: "var",
    library: "Client",
  },
};
