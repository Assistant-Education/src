//============================================================
// Проверяем в каком режиме запущен npm (prod или dev)
const isProd = process.env.NODE_ENV === 'production'; // true or false


//============================================================
// Подключение плагинов
const
    path               = require('path'),                       // для работы с папками
    webpack            = require('webpack'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),       // для удаления файлов
    HtmlWebpackPlugin  = require('html-webpack-plugin'),        // для експорта и минификации HTML
    ExtractTextPlugin  = require('extract-text-webpack-plugin');// для извлечеиня из bundel в одельный файл


//============================================================
// Изначальные пути
const
    production = 'dist',
    develop    = 'src',

    DIST_DIR = path.resolve(__dirname, production),
    SRC_DIR  = path.resolve(__dirname, develop);


//============================================================
// Конфигурацыи (настройки) для плагинов
    //___________________________________________________________
const
    //подключаем библиотеки ЛОКАЛЬНО! // нужно писать import X from 'library'
    libs = [], // ['jquery', 'react', 'react-dom']
    //подключаем библиотеки ГЛОБАЛЬНО! // если не хочем писать import X from 'library'
    provideVendorGlob = new webpack.ProvidePlugin({
      $:        'jquery',
      React:    'react',
      ReactDOM: 'react-dom'
    });

    //___________________________________________________________
const
    //WOW подключаем динамически наши библиотеки
    chunkVendor = new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: ({ resource }) => /node_modules/.test(resource)
    });

    //___________________________________________________________
const
    //удаляем концевою папку сборки чтоб не было конфликтов
    cleanFolderProd = new CleanWebpackPlugin(production);

    //___________________________________________________________
const
    //компилируем (создаем) index.html из src
    htmlIndex = new HtmlWebpackPlugin(
        {
          filename: 'index.html', template: 'src/index.html'
        }
        ),
    htmlSecond = new HtmlWebpackPlugin(
        {        filename: 'second.html',
          template: 'src/second.html',
        chunks: ['second']
        }
    );

    //___________________________________________________________
const
    //достаем (создаем) наш готовый css из bundle.js
    extractCss = new ExtractTextPlugin('css/[name].css');

    //___________________________________________________________
const
    //минифицыруем все bundles
    uglifyJs = new webpack.optimize.UglifyJsPlugin();

    //___________________________________________________________
const
    //фих зна :( react советует добавлять етот плагин, для концевои сборки иначе ошибка
    //библиотеки react уменшиваються
    definePlugin = new webpack.DefinePlugin(
        { 'process.env': {NODE_ENV: JSON.stringify('production')} }
        );


//============================================================
// Конфигурацыи (настройки) для модуля
    //___________________________________________________________
    //HTML Config
    //минифицируем толька когда production isProd === true
const htmlConfig = [{
  loader: 'html-loader',
  options: { minimize: isProd }
}];

//___________________________________________________________
//CSS Config
//конфигурация для разработки (транспилируем sass в css)
const cssDev = ['css-loader', 'sass-loader'];
//конфигурация для сборки (sass в css + минифицируем + автопрефикс)
const cssProd = [
  'css-loader',
  {
    loader: 'postcss-loader',
    options: {
      plugins() { return [require('autoprefixer'), require('cssnano')]; },
    },
  },
  'sass-loader',
];
//ввыбор конфигурации для CSS
const cssConfig = isProd ? cssProd : cssDev;

//___________________________________________________________
//IMG Config
//конфигурация для разработки (подгружаем картинки)
const imgDev = [{
  loader: 'file-loader',
  options: {
    name: '[name].[ext]',
    outputPath: 'img/'
  }
}];
//конфигурация для сборки (подгружаем картинки + минифицируем)
const imgProd =  [{
  loader: 'file-loader',
  options: {
    name: '[name].[ext]',
    outputPath: 'img/'
  }
},
  {
    loader: 'image-webpack-loader',
    options: {
      optipng:  { optimizationLevel: 7 },
      pngquant: { quality: '65-90', speed: 4 },
      mozjpeg:  { progressive: true, quality: 65 }
    }
  }
];
//ввыбор конфигурации для IMG
const imgConfig = isProd ? imgProd : imgDev;


//___________________________________________________________
//JS Config
//конфигурации настройки для Babel
const jsConfig = [{
  loader: 'babel-loader',
  options: {
    presets: ["react", "es2015", "stage-2"]
  }
}];


//============================================================
//MODULE
const config = {
  entry: {
    index: SRC_DIR + '/js/index.js',
    //vendor открываем тока когда нужно использовать локально библиотекм
    //vendor: libs,
  },
  output: {
    path: DIST_DIR + '/',
    filename: '[name].bundle.js',
  },
  //devtool: 'source-map',
  module: {
    rules: [
      //HTML
      {
        test: /\.html$/,
        use: htmlConfig
      },
      //CSS
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: extractCss.extract({
          fallback: 'style-loader',
          use: cssConfig
        })
      },
      //JS & JSX
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: jsConfig
      },
      //IMG
      {
        test: /\.(jpg|png|svg)$/,
        exclude: /node_modules/,
        use: imgConfig,
      },
      //Additional HTML
   /*   {
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
  devServer: {
    port: 9000,
    open: true,
    compress: true
    //stats: "errors-only",
  },
  plugins: isProd?
      // плагины для production
      [ cleanFolderProd,
        htmlIndex,
        extractCss,
        definePlugin,
        uglifyJs,
        provideVendorGlob,
        chunkVendor
      ]:
      // плагины для develop
      [ htmlIndex,
       // htmlSecond,
        extractCss,
        provideVendorGlob,
        chunkVendor
      ]
};

module.exports = config;