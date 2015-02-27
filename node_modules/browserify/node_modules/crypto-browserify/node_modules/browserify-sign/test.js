var keys = {
  priv: '-----BEGIN EC PRIVATE KEY-----\n' +
        'MHcCAQEEIF+jnWY1D5kbVYDNvxxo/Y+ku2uJPDwS0r/VuPZQrjjVoAoGCCqGSM49\n' +
        'AwEHoUQDQgAEurOxfSxmqIRYzJVagdZfMMSjRNNhB8i3mXyIMq704m2m52FdfKZ2\n' +
        'pQhByd5eyj3lgZ7m7jbchtdgyOF8Io/1ng==\n' +
        '-----END EC PRIVATE KEY-----\n',
  pub: '-----BEGIN PUBLIC KEY-----\n' +
       'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEurOxfSxmqIRYzJVagdZfMMSjRNNh\n' +
       'B8i3mXyIMq704m2m52FdfKZ2pQhByd5eyj3lgZ7m7jbchtdgyOF8Io/1ng==\n' +
       '-----END PUBLIC KEY-----\n'
};

var rsapriv = ['-----BEGIN RSA PRIVATE KEY-----',
'MIICXAIBAAKBgQC3b8UwVmFgZaWvgzInZ7wjt95FkjyTD5L2QkMyjl3ZsOeG5LS1',
'qlUltsRgVt3J/NQH7CAc3gbGWhcinaHJdwuRA4mUBnZL/kW/qbnHLSvYnSxZOFYu',
'oF5o9U22WPD/LTYBdL7er3ZqTuTeMernkbHUU3F5XSKs+ISBsXcofeGwZQIDAQAB',
'AoGAZDHr3mRAWhwLbRvXSEjULhpfkVa4OYeXOWWmOLYksyR6wmaoAlagnbH//7NS',
'/+JWmmEyhTINN0i8PE8nsNiSetw/bdqgjFEZCtAUa7FVxaUirGd0p0mHl/GuhDqj',
'sG/qxB7Ny0+EyBKchV5srDUNt1iFTw6+UmHu+xTL/27UZaECQQDuyRfF/Z3EEaq3',
'mHU31oazzH90BH2wMwc3HMnlHs4l+mQblhTSB1khECxFJrNeUUSVlKg7mTq95bGy',
'HbMYaattAkEAxKkvbG2sxzStECvy5WHbSMPhj56oIiirA7xMc8Ox6+Jiycm1mHb4',
'7Po0VsAb2EhhLyEm5AKnrySuHZP4UadF2QJBALcruTne+APszXly0RBZVxFboLV9',
'sHDWZAWJ5vIEdHy7m8lxkl0e1+c+Ace2DUgfrS3VUEwPmfkL1wjcMYNbo+0CQESW',
'oSSW58CeXZGbUl6wD3PEZYHamtc3CdYGsT9azE3xqfSotf4T2GOGLATpgYygSczP',
'Kioxxtvt1hAY0G1iApkCQGwKxnLh4wAgxUh+co1OHo3u5BePmORHodVkmQC6+NR9',
'LGexO8bh6gpF9nMfVpT7Dd6M7YucC52gd6o0yhGT1SU=',
'-----END RSA PRIVATE KEY-----',''].join('\n');
var unpack = require('rsa-unpack');

console.log(unpack(keys.pub));
// console.log(decode(keys.pub));
// console.log(decode(keys.priv+'\n' + keys.pub));

var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

// Generate keys
var key = ec.genKeyPair();
console.log(key.getPublic(false, 'hex'));