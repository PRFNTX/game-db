const webpack = require('webpack')
const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const fs = require("fs");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
var exec = require('child_process').exec;

class DockerRestart {
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    // Specify the event hook to attach to
    compiler.hooks.done.tapAsync(
      'restartDocker',
      (compilation, callback) => {
        exec("docker compose restart")
        callback();
      }
    );
  }
}

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        server: "./server/server.ts",
        app: "./src/index.js",
    },
    module: {
        rules: [
            {
                test: /.*\/server.*\.[jt]s$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                          "@babel/preset-env",
                          "@babel/preset-typescript",
                        ],
                    },
                },
                exclude: /node_modules/
            },
            {
                test: /.*\/src.*\.[jt]s$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                          "@babel/preset-env",
                          "@babel/preset-react",
                          "@babel/preset-typescript",
                        ],
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.s?css$/,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.(png|jp(e*)g|svg|gif)$/,
                use: ['file-loader'],
            },
        ],
    },
    resolve: {
        extensions: ["", ".ts", ".js"],
        fallback: {
            "fs": false,
            "tls": false,
            "net": false,
            "path": false,
            "zlib": false,
            "http": false,
            "https": false,
            "stream": false,
            "crypto": false,
            "crypto-browserify": false,
            "util": false,
        },
    },
    output: {
        filename: "[name].build.js",
        path: path.resolve(__dirname, "build"),
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new DockerRestart(),
    ]
}
