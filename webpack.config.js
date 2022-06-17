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

const baseConfig = {
    mode: "development",
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
            }
        ],
    },
    resolve: {
        extensions: ["", ".ts", ".js"],
        fallback: {
            fs: false,
            net: false,
            crypto: false,
            zlib: false,
            "http": require.resolve("stream-http")
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

const nodeConfig = {
    ...baseConfig,
    target: 'node18',
    output: {
        filename: "[name].build.js",
        path: path.resolve(__dirname, "build/node"),
    },
    entry: {
        server: "./server/server.ts",
    },
}

const browserConfig = {
    ...baseConfig,
    output: {
        filename: "[name].build.js",
        path: path.resolve(__dirname, "build"),
    },
    entry: {
        app: "./src/index.js",
    },
}

module.exports = [nodeConfig, browserConfig]
