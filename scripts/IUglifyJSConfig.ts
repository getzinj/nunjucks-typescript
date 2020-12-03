export interface IUglifyJSConfig {
  sourceMap: boolean;
  uglifyOptions: {
    compress: {
      unsafe: boolean
    };
    mangle: {
      properties: {
        regex: RegExp
      }
    }
  };
}
