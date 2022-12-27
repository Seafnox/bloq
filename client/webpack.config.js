const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';
const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';

const config = {
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: 'game.js'
    },
    devServer: {
        open: false,
        host: '0.0.0.0',
        historyApiFallback: true,
        hot: true,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
        alias: {
            modernizr$: path.resolve(__dirname, "./src/.modernizrrc"),
        },
        plugins: [
            new TsconfigPathsPlugin(),
        ],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.sass|scss$/i,
                use: [stylesHandler, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(glsl|vs|fs)$/,
                loader: 'ts-shader-loader',
            },
            {
                test: /\.(png|jpeg|jpg|svg)$/,
                loader: 'file-loader',
            },
            {
                test: /\.(ogg|mp3)$/,
                loader: 'file-loader',
            },
            {
                test: /\.(mesh)$/,
                loader: 'file-loader',
            },
            {
                test: /\.modernizrrc$/,
                use: ['@sect/modernizr-loader'],
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/i,
                type: 'asset',
            },
//            {
//                test: /\.(glsl|vs|fs)$/,
//                type: 'asset',
//            },
//            {
//                test: /\.(png|jpeg|jpg|svg)$/,
//                type: 'asset',
//            },
//            {
//                test: /\.(ogg|mp3)$/,
//                type: 'asset',
//            },
//            {
//                test: /\.(json)$/,
//                type: 'asset',
//            },

            // Add your rules for custom modules here https://webpack.js.org/loaders/
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Bloq',
            filename: 'index.html',
            template: './src/assets/index.html',
            inject: false,
        }),
        // Add your plugins here https://webpack.js.org/configuration/plugins/
    ],
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        config.plugins.push(new MiniCssExtractPlugin());
        config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
    } else {
        config.mode = 'development';
    }

    return config;
};
