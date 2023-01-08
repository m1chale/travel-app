const path = require("path");
const webpack = require("webpack");
const htmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/website/index.js",
  mode: "production",
  module: {
    rules: [],
  },
  optimization: {},
  plugins: [
    new htmlWebpackPlugin({
      template: "./src/website/index.html",
      filename: "./index.html",
    }),
  ],
  output: {
    clean: true,
    libraryTarget: "var",
    library: "Client",
  },
};
