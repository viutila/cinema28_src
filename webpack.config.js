var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: path.join(__dirname, "build"),
  devtool: debug ? "inline-sourcemap" : "cheap-module-source-map",
  entry: "./js/source.js",
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0'],
          plugins: ['react-html-attrs', 'transform-class-properties', 'transform-decorators-legacy'],
        }
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader?url=false"
      },
      { test: /\.(png|woff|woff2|eot|ttf|svg|gif)$/, 
        use:[
          {
            loader: 'file-loader',
            options: {
              emitFile: false,
              name: '[path][name].[ext]'
            }
          }
        ]
      },
    ]
  },
  output: {
    path: __dirname + "/build/",
    filename: "source.min.js"
  },
  resolve: {
    modules: ["build", "node_modules"]
  },
  devServer: {
    proxy: [
      {
        context: ['/cgi-bin/**', '/apps/**', '/qsirch/**', '/RSS/**', '/v3_menu/**'],
        target: 'http://localhost:8080',
        secure: false
      },
      {
        context: ['/img/device_panel/**'],
        target: 'http://localhost:8080/apps/Cinema28',
        secure: false
      }
    ]
  },
  plugins: debug ? [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ]
  :
  [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
  ],
  
};
