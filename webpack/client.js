const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const { NODE_ENV } = process.env
const isDev = !NODE_ENV
const isBuild = NODE_ENV === 'build'
const isTemp = NODE_ENV === 'temp'
const isProd = NODE_ENV === 'production'

const { hotPort, loaders } = require('./share')
const pkg = require('../package.json')

module.exports = {
  entry: isBuild || isTemp ? {
    'owl-ui': ['./src/components']
  } : {
    lib: ['vue', 'vue-router', 'delegate-to', 'mark-it-down', '@cepave/owl-icons'],
    app: [
      './src/client',
    ]
  },

  performance: {
    hints: isProd ? 'warning' : false,
  },

  devtool: isDev ? '#eval' : false,
  watch: isDev,

  output: {
    path: `${__dirname}/../${isBuild ? 'npm/dist' : isProd ? 'gh-pages' : 'dist'}`,
    filename: '[name].js',
    // publicPath: isDev ? `http://0.0.0.0:${hotPort}/` : undefined,
    libraryTarget: isBuild ? 'commonjs2' : 'var',
  },

  resolve: {
    alias: {
      '~dist': `${__dirname}/../dist`,
      '~com': `${__dirname}/../src/components`,
    }
  },

  module: {
    rules: [
      {
        test: /\.(svg|png|jpg)$/,
        use: ['url-loader']
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: ['babel-loader']
      },
      {
        test: /\.md$/,
        use: ['raw-loader']
      },
      ...isDev ? [loaders.css] : [{
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader?modules&localIdentName=ou-[name]_[local]',
            'sass-loader'
          ],
          fallback: 'style-loader',
        })
      }]
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV || 'development'),
      },
      __pkgVer: `'${pkg.version}'`,
    }),

    ...isDev || isProd ? [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'lib',
        filename: 'lib.js'
      }),
      new HtmlWebpackPlugin({
        title: 'OWL UI · Design System - Cepave F2E',
        filename: 'index.html',
        template: './scripts/gh-pages.html',
        minify: {
          collapseWhitespace: true,
        }
      }),

      ...isProd ? [new ExtractTextPlugin('app.css')] : []
    ] : [
      new ExtractTextPlugin('owl-ui.css'),

      ...isProd ? [new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })] : []
    ],
  ],

  externals: isDev || isProd ? [] : Object.keys(pkg.dependencies),
}
