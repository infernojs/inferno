const {
  TRAVIS_BRANCH
} = process.env;

class Config {
  constructor() {
    this.launchers = {};
    this.browsers = [];
  }
  add(platform, browser, version) {
    const sauceName = `Sauce_${platform}_${browser}@${version}`;
    const config = {
      base: 'SauceLabs',
      platform,
      browser,
      version
    };
    this.launchers[sauceName] = config;
    this.browsers.push(sauceName);
  }
}

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
    firefox: [ '49', '50', 'beta' ],
    MicrosoftEdge: [ '13', '14' ]
  },
  'OS X 10.11': {
    chrome: [ '53', '54', 'beta' ],
    firefox: [ '49', '50', 'beta' ],
    safari: [ '9', '10' ]
  },
  Linux: {
    chrome: [ '47', '48' ],
    firefox: [ '44', '45' ]
  }
};

const config = new Config();
for (const platform in browsers) {
  for (const browser in browsers[platform]) {
    const versions = browsers[platform][browser];
    for (let i = 0; i < versions.length; i += 1) {
      config.add(platformNames[platform], browser, versions[i]);
    }
  }
}

module.exports = config;