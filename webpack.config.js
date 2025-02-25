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

  starter.loaders.css.use[1].options.url = {
    filter: (url, resPath) => {
      const dir = OsPathUtils.dirname(resPath);
      const relativePath = OsPathUtils.relative(srcRoot, dir);
      if (relativePath) {
        const fixUrl = UnixPathUtils.join(relativePath, url);
        console.log(fixUrl);
        return fixUrl;
      }
      return url;
    }
  };
  // starter.loaders.cssModule.use[1].options.url = false;

  return starter.export();
};
