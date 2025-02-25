const Starter = require('@zenstone/webpack-starter');
const OsPathUtils = require('node:path');
const UnixPathUtils = require('node:path/posix');

module.exports = function (runtime) {
  const root = process.cwd();
  const srcRoot = OsPathUtils.join(root, 'src');

  const starter= Starter.create({
    runtime,
  }).setDevServer(devServer => {
    devServer.historyApiFallback = true;
    devServer.port = 40001;
    return devServer;
  });

  delete starter.loaders.svg;

  return starter.export();
};
