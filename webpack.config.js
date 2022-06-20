const webpack = require('webpack')
const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const Dotenv = require('dotenv-webpack');
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
        exec("docker compose restart web")
        callback();
      }
    );
  }
}

const baseConfig = {
    mode: "production",
    entry: {
        app: "./src/index.js",
    },
    resolve: {
        extensions: ["", ".ts", ".js", ".scss", ".css"],
        fallback: {
            fs: false,
            net: false,
            crypto: false,
            zlib: false,
            "http": require.resolve("stream-http")
        },
    },
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
        ]
    },
    output: {
        filename: "[name].build.js",
        path: path.resolve(__dirname, "build"),
    },
    plugins: [
        new DockerRestart(),
        new Dotenv(),
    ]
}

const browserConfig = {
    ...baseConfig,
    output: {
        filename: "[name].build.js",
        path: path.resolve(__dirname, "public"),
    },
    entry: {
        app: "./src/index.js",
    },
    module: {
        rules: [
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
        ]
    },
    plugins: [
        new MiniCssExtractPlugin(),
    ]
}

module.exports = [nodeConfig, browserConfig]
