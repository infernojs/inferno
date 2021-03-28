const zlib = require('zlib');

const bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return '0 Byte';
  }
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return Math.round(bytes / 1024 ** i, 2) + sizes[i];
};

// Preprocess files to provide a gzip compressed alternative version
function Preprocessor(config, logger) {
  const log = logger.create('preprocessor.gzip');

  return (content, file, done) => {
    const originalSize = content.length;
    // const contentBuffer = Buffer.isBuffer(content) ? content : Buffer.from(content);

    zlib.gzip(content, (err, gzippedContent) => {
      if (err) {
        log.error(err);
        done(err);
        return;
      }

      // eslint-disable-next-line no-param-reassign
      file.encodings.gzip = gzippedContent;

      log.info(`compressed ${file.originalPath} [${bytesToSize(originalSize)} -> ${bytesToSize(gzippedContent.length)}]`);
      done(null, content);
    });
  };
}

Preprocessor.$inject = ['config.gzip', 'logger'];

module.exports = {
  'preprocessor:gzip': ['factory', Preprocessor]
};
