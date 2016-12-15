const glob = require('glob');
const path = require('path');
require('ts-node/register');

glob(path.join(__dirname, '../', 'src/**/__benchmarks__/**/*'), (err, files) => {
  if (err) throw new Error(err);

  files.forEach((file) => {
    require(file);
  });
});