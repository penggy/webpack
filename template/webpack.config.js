const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

function resolve(dir) {
  return path.resolve(__dirname, dir)
}

module.exports = {
  entry: {
    "index": ['babel-polyfill', resolve('index.js')]
  },
  output: {
    path: resolve('dist'),
    chunkFilename: 'js/[name].[chunkhash:8].js',
    filename: `js/[name].[chunkhash:8].js`
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
      'assets': resolve('assets'),
      'components': resolve('components')
    }
  },
  devServer: {
    host: '0.0.0.0',
    useLocalIp: true,
    proxy: [{
      context: ["/ws", "/wss"],
      target: 'ws://localhost:3000',
      ws: true
    }, {
      context: "*",
      target: 'http://localhost:3000',
      secure: false
    }]
  },
  devtool: '#eval-source-map',
  performance: {
    hints: false
  },
  module: {
    rules: [{
        test: require.resolve('jquery'),
        use: [{
            loader: 'expose-loader',
            options: '$'
        }]
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      include: __dirname,
      exclude: /node_modules/
    }, {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loaders: {
          css: ExtractTextPlugin.extract({
            publicPath: '../',
            fallback: 'vue-style-loader', //this is a dep of vue-loader, so no need to explicitly install if using npm3
            use: 'css-loader'
          })
        },
        postcss: [
          require('autoprefixer')()
        ]
      }
    }, {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        publicPath: "../",
        fallback: "style-loader",
        use: "css-loader"
      })
    }, {
      test: /\.less$/,
      use: ExtractTextPlugin.extract({
        publicPath: "../",
        fallback: "style-loader",
        use: "css-loader!less-loader"
      })
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        outputPath: "images/",
        limit: 10000,
        name: "[name].[hash:8].[ext]"
      }
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        outputPath: "fonts/",
        limit: 10000,
        name: "[name].[hash:8].[ext]"
      }
    }, {
      test: /\.(swf|mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        outputPath: "media/",
        limit: 10000,
        name: "[name].[hash:8].[ext]"
      }
    }]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      "window.jQuery": 'jquery',
      "window.$": 'jquery'
    }),
    new webpack.HashedModuleIdsPlugin(),
    new CopyWebpackPlugin([
      { from: 'externals' }
    ]),
    new ExtractTextPlugin('css/[name].[chunkhash:8].css'),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true
    }),    
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: '{{ name }}',
      inject: true, // head -> Cannot find element: #app
      chunks: ['index'],
      template: './index.html'
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new CleanWebpackPlugin(['dist']),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      comments: false,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
