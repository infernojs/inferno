const config = {};

for (let platform in ['Windows 10', 'OS X 10.11']) {
  for (let version in ['beta', '54, 53']) {
    config['sl_chrome-' + platform + '-' + version] = {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform,
      version
    }
  }

  for (let version in ['beta', '50, 49']) {
    config['sl_chrome-' + platform + '-' + version] = {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform,
      version
    }
  }
}

for (let version in ['10', '9']) {
  config['sl_chrome-linux-' + version] = {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11',
    version
  }
}

for (let version in ['48', '47']) {
  config['sl_chrome-linux-' + version] = {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Linux',
    version
  }
}

for (let version in ['45', '44']) {
  config['sl_chrome-linux-' + version] = {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'Linux',
    version
  }
}



config['sl_edge'] = {
  base: 'SauceLabs',
  browserName: 'MicrosoftEdge',
  platform: 'Windows 10'
}

module.exports = config;