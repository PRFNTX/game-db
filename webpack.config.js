const path = require("path")

module.exports = {
    entry: [
        "./server/app/server.ts",
        "./src/index.js"
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                excldude: "/node_modules/",
            },
            {
                test: /\.scss?$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ]
            },
        ],
    },
    resolve: ["ts",],
    output: "server.js"
    path: path.resolve(__dirname, "build"),
}
