
//============================================================
// Подключение плагинов
const
    path               = require('path'),                       // для работы с папками
    webpack            = require('webpack'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),       // для удаления файлов
    HtmlWebpackPlugin  = require('html-webpack-plugin'),        // для експорта и минификации HTML
    ExtractTextPlugin  = require('extract-text-webpack-plugin'),// для извлечеиня из bundel в одельный файл
    UglifyJSPlugin     = require('uglifyjs-webpack-plugin');    // для минификации

const
    DIST_DIR = path.resolve(__dirname, 'dist'),
    SRC_DIR = path.resolve(__dirname, 'src');
//============================================================
// Конфигурацыи (настройки) для плагинов
const
    //библиотеки
    vendor = new webpack.ProvidePlugin({
      $: 'jquery',
      React: 'react',
      ReactDOM: 'react-dom'
    }),

    //сперва удаляем концевою папку сборки чтоб не было конфликтов
    cleanWebpackPlugin = new CleanWebpackPlugin('dist'),

    //компилируем новый index.html из src
    htmlWebpackPlugin = new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),

    //достаем наш готовый css и задаем имя
    extractTextPlugin = new ExtractTextPlugin({
      filename: 'main.css'
    }),

    //минифицыруем bundle (для быстроты кешируем процес)
    uglifyJSPlugin    = new UglifyJSPlugin({
      parallel: {
        cache: true,
        workers: 2 // for e.g
      },
      output: {
        comments: false,
        beautify: false,
      }
    });


//============================================================
const config = {
  entry: {
    app:  SRC_DIR + '/js/index.js'
    //libs: ['jquery']
  },

  output: {
    path: DIST_DIR + '/',
    filename: 'bundle.js'
  },

  module: {
    rules: [
      //HTML
      {
        test: /\.html$/,
        use: [ {
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }],
      },
      //CSS
      {
        test: /\.scss$/,
        use: extractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader',
            // СSS минифицируем + префиксы тока когда production
            /*
            {
              loader: 'postcss-loader',
              options: {
                plugins() { return [require('autoprefixer'), require('cssnano')] }
              }
            },
            */
            'sass-loader'
          ]
        })
      },
      //JS
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ["react", "es2015", "stage-2"]
          }
        }]
      },
      //IMG
      {
        test: /\.(jpg|png|svg)$/,
        use: [{
          //отправляем
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'img/'
          }
        },
          // IMG минифицируем тока когда build
           /*
          {
            loader: 'image-webpack-loader',
            options: {
              optipng:  { optimizationLevel: 7 },
              pngquant: { quality: '65-90', speed: 4 },
              mozjpeg:  { progressive: true, quality: 65 }
            }
          }
          */
        ]
      },
      //Additional HTML or use htmlWebpackPlugin Again!
      /*{
       test: /\.html$/,
       use: [{
       loader: 'file-loader',
       options: {
       name: '[name].[ext]'
       }
       }],
       exclude: path.resolve(__dirname, 'src/index.html'),
       }*/
    ]
  },

  plugins: [
   // new webpack.optimize.CommonsChunkPlugin('libs.js'),
    vendor,
    cleanWebpackPlugin,
    htmlWebpackPlugin,
    uglifyJSPlugin,
    extractTextPlugin
  ]
};

module.exports = config;