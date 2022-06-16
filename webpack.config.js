const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
    mode: "development",
    entry: [
        "./server/server.ts",
        "./src/index.js"
    ],
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                use: "ts-loader",
                exclude: "/node_modules/",
            },
            {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ]
            },
        ],
    },
    resolve: {
        extensions: ["ts", "js", "tsx"],
    },
    output: {
        filename: "[name].build.js",
        path: path.resolve(__dirname, "build"),
    }
}
