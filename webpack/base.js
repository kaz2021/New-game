const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  // フルソースマップを生成して VS Code のブレークポイントで元のソースにマップされるようにする
  devtool: "source-map",
  entry: './src/index.js',  // ここをmodule内から移動
  output: {
    filename: 'bundle.js',
    // 出力先はプロジェクトルート/dist
    path: path.resolve(__dirname, '..', 'dist'),
    // devtools が生成するモジュールファイル名をワークスペースのパスにマップ
    devtoolModuleFilenameTemplate: info =>
      `webpack:///${path.relative(process.cwd(), info.resourcePath).replace(/\\/g, '/')}`
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: "raw-loader"
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        use: "file-loader"
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ]
  ,
  // 開発時の簡易サーバー設定 (webpack-dev-server)
  devServer: {
    static: {
      // プロジェクトルートを公開
      directory: path.resolve(__dirname, '..')
    },
    // 既に 8080 が使用中の環境向けに 8081 を使用
    port: 8081,
    hot: true,
    open: true,
    client: {
      overlay: true
    }
  }
};