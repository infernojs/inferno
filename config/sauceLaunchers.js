const config = {};

/* =============
    CHROME
============== */
// ['beta', '54', '53'].forEach((version) => {
//   // Windows
//   config['sl_chrome-win-' + version] = {
//     base: 'SauceLabs',
//     browserName: 'chrome',
//     platform: 'Windows 10',
//     version
//   };

//   // MAC
//   config['sl_chrome-osx-' + version] = {
//     base: 'SauceLabs',
//     browserName: 'chrome',
//     platform: 'OS X 10.11',
//     version
//   };
// });

// // LINUX
// ['48', '47'].forEach((version) => {
//   config['sl_firefox-linux-' + version] = {
//     base: 'SauceLabs',
//     browserName: 'chrome',
//     platform: 'Linux',
//     version
//   };
// });

// /* =============
//   FIREFOX
// ============= */
// ['beta', '50', '49'].forEach((version) => {
//   // Windows
//   config['sl_chrome-win-' + version] = {
//     base: 'SauceLabs',
//     browserName: 'firefox',
//     platform: 'Windows 10',
//     version
//   };
  
//   // MAC
//   config['sl_chrome-osx-' + version] = {
//     base: 'SauceLabs',
//     browserName: 'firefox',
//     platform: 'OS X 10.11',
//     version
//   };
// });

// // Linux
// ['45', '44'].forEach((version) => {
//   config['sl_firefox-linux-' + version] = {
//     base: 'SauceLabs',
//     browserName: 'firefox',
//     platform: 'Linux',
//     version
//   };
// });

// /* =============
//   SAFARI
// =============== */
// ['10', '9'].forEach((version) => {
//   config['sl_safair-linux-' + version] = {
//     base: 'SauceLabs',
//     browserName: 'safari',
//     platform: 'OS X 10.11',
//     version
//   };
// });

// /* ===============
//   EDGE
// ================= */
// ['14', '13'].forEach((version) => {
//   config['sl_edge-' + version] = {
//     base: 'SauceLabs',
//     browserName: 'MicrosoftEdge',
//     platform: 'Windows 10',
//     version
//   };
// });

// ['8', '9', '10', '11'].forEach((version) => {
//   config['sl_ie-' + version] = {
//     base: 'SauceLabs',
//     browserName: 'Internet Explorer',
//     platform: 'Windows 7',
//     version
//   };
// });

[ 'Windows 10', 'OS X 10.11'].forEach((platform) => {
  config['sl_chrome-54-' + platform] = {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform,
    version: '54'
  };

  config['sl_chrome-beta-' + platform] = {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform,
    version: 'beta'
  };
});

/* ==============
    IE 
================== */

console.log(config);
module.exports = config;