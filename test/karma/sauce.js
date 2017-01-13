const {
	TRAVIS_BRANCH
} = process.env;

const platformNames = {
	'Windows 7': 'Win7',
	'Windows 10': 'Win10',
	'OS X 10.11': 'Mac',
	Linux: 'Linux'
};

const browsers = {
	'Windows 7': {
		'Internet Explorer': ['11']
	},
	'Windows 10': {
		chrome: [ '53', '54', 'beta' ],
		firefox: [ '49', '50' ],
		MicrosoftEdge: [ '13', '14' ]
	},
	'OS X 10.11': {
		safari: [ '9', '10' ]
	}
};

class Config {
	constructor() {
		this.launchers = {};
		this.browsers = [];
	}
	add(platform, browser, version) {
		const sauceName = `Sauce_${platformNames[platform]}_${browser}@${version}`;
		const config = {
			base: 'SauceLabs',
			browserName: browser,
			platform,
			version
		};
		this.launchers[sauceName] = config;
		this.browsers.push(sauceName);
	}
}

const config = new Config();
for (let platform in browsers) {
	for (let browser in browsers[platform]) {
		const versions = browsers[platform][browser];
		for (let i = 0; i < versions.length; i += 1) {
			config.add(platform, browser, versions[i]);
		}
	}
}

module.exports = config;
