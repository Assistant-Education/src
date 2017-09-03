//============================================================
// Path
const
    srcFolder  = ['./src/js/app.js'], // файли которые нужно обрабативать
    distFolder = 'dist';              // папка куда одправляються файли


//============================================================
// Подключение плагинов
const
    path               = require('path'),                       // для работы с папками
    webpack            = require('webpack'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),       // для удаления файлов
    HtmlWebpackPlugin  = require('html-webpack-plugin'),        // для експорта и минификации HTML
    ExtractTextPlugin  = require('extract-text-webpack-plugin'),// для извлечеиня из bundel в одельный файл
    UglifyJSPlugin     = require('uglifyjs-webpack-plugin');    // для минификации

//============================================================
// Конфигурацыи (настройки) для плагинов
const
    //библиотеки
    vendor = new webpack.ProvidePlugin({
      $: 'jquery', jQuery: 'jquery'
    }),

    //сперва удаляем концевою папку сборки чтоб не было конфликтов
    cleanWebpackPlugin = new CleanWebpackPlugin([distFolder]),

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
module.exports = {

  entry: srcFolder,

  output: {
    path: path.resolve(__dirname, distFolder),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      //HTML
      {
        test: /\.html$/,
        use: ['html-loader']
      },
      //CSS SASS
      {
        test: /\.scss$/,
        use: extractTextPlugin.extract({
          use: ['css-loader', 'sass-loader']
        })
      },
      //JS
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react']
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
        }, /*{
          //минифицируем тока когда build
          loader: 'image-webpack-loader',
          options: {
            optipng:  { optimizationLevel: 7 },
            pngquant: { quality: '65-90', speed: 4 },
            mozjpeg:  { progressive: true, quality: 65 }
          }
        }*/]
      },
      //Additional HTML
      {
        test: /\.html$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        }],
        exclude: path.resolve(__dirname, 'src/index.html'),
      }
    ]
  },

  plugins: [
    vendor,
    cleanWebpackPlugin,
    htmlWebpackPlugin,
    uglifyJSPlugin,
    extractTextPlugin
  ]
};
