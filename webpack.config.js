const path = require('path');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin');
const { NODE_ENV = 'production' } = process.env;
module.exports = {
    entry: './src/server/index.ts',
    mode: NODE_ENV,
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader'],
            },
        ],
    },
    externals: [nodeExternals()],
    watch: NODE_ENV === 'development',
    plugins:
        NODE_ENV === 'development'
            ? [
                  new WebpackShellPlugin({
                      onBuildEnd: ['yarn run:dev'],
                  }),
              ]
            : [],
};
