const processPackages = require('./packages');
const packages = processPackages();

console.log('-- Batches to be processed --');
packages.batches.forEach((pkgs, i) => console.log(`Batch ${i}: ${pkgs.map(pkg => pkg.name).join(', ')}`));
