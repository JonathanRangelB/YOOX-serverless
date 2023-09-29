const slsw = require('serverless-webpack');

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  devtool: false, // to generate .map file: 'source=map' to not generate it: false
  optimization: {
    minimize: true, // Evita la minificación para que el código sea más legible: slsw.lib.webpack.isLocal ? false : true,
  },
  externals: [/^aws-sdk/], // Excluye aws-sdk ya que está disponible en AWS Lambda
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
          },
        },
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.json', '.wasm'],
  },
};
