const path = require("path")
const webpack = require("webpack")

module.exports = {
  config: {
    entry: {
      root:  ["@babel/polyfill", "./static/js/entry/root"],
      header:  ["@babel/polyfill", "./static/js/entry/header"],
      style: "./static/js/entry/style"
    },
    module: {
      rules: [
        {
          test: /\.(svg|ttf|woff|woff2|eot|gif)$/,
          use:  "url-loader"
        }
      ]
    },
    resolve: {
      modules:    [path.join(__dirname, "static/js"), "node_modules"],
      extensions: [".js", ".jsx"]
    },
    performance: {
      hints: false
    }
  },
  babelSharedLoader: {
    test:    /\.jsx?$/,
    loader:  "babel-loader",
    query:   {
      presets: [
        ["@babel/preset-env", { modules: false }],
        "@babel/preset-react",
        "@babel/preset-flow"
      ],
      plugins: [
        "@babel/plugin-transform-flow-strip-types",
        "react-hot-loader/babel",
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-syntax-dynamic-import"
      ]
    }
  }
}
