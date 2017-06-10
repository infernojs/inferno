var glob = require('glob');
var prependFile = require('prepend-file');
const { join } = require('path');

const cwd = process.cwd();
const pkgJSON = require(join(cwd, './package.json'));

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

String.prototype.capitalize = function() {
	return `${this.split('-').map(capitalize).join('-')}`;
};

const HEADER = `/**
 * @module ${pkgJSON.name.capitalize()}
 */ /** TypeDoc Comment */

`;

function prepend(filepath) {
	prependFile(filepath, HEADER, err => {
		if (err) {
			console.error(filepath, err);
		}
	});
}

glob(`${cwd}/src/**/*.ts`, function(err, files) {
	if (err) {
		console.error(er);
		process.exit(1);
	}

	files.forEach(prepend);
});
