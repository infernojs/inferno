# pemstrip

Strips private keys, pem files and other PKI artifacts down to plain base64 strings, and packs them back up. Converts this:

```
-----BEGIN RSA PRIVATE KEY-----
MIIBywIBAAJhAOH/GYm6UPad21b4uEQU3bAJqlP2sDuRCv4I0iThtYT6wcQTXrnx
TXQzT24FNpZJ5saVGnyaBxmhnz5F1Pe2/5ERfhRSpfjqMRim8iO8mN5wTuHFEsCZ
r2voIiPQYgT6HQIDAQABAmBlQ993nWrl9rnv8KbwqsDjPpF56hHxvv5D8kPnjtO9
cHcemudZPkzMgqlWzTM2iInuJI1K7kpEh5nDuMv0/RGn31/+IPKBtKDv5HRHAGQE
43ByQaKO0Wi/uA3WoH6DhkECMQD8l0YRmJVTQu/8LsO7anCc9H6I/1vNooHJK5r0
EnvyjM1Qp2V8FRtZvRrSCtQJp6UCMQDlC/CQE4yQxoIbagJQHSWMzRgdWpJzDPC0
gZkqW8AnyHhUMmZsvbMc9BOxQtDqPxkCMQCatNyJsnbjREBQqSPhClRnDajip+TG
kh4D5N1HWHrqGCs4lw6lbRgPYq+mrlMohrECMQCbw9/oi3LnrigjLpe+FeRIed3x
cHvyBBXaG9ym4tit9XZnhBMF1ohto0uVHCRpeVkCMAy9rpfJodk5DOzPIQ+bwvah
jPpadPcD0t1u6LVReHds7mtqn8uYSIKEYzTL/xgbtQ==
-----END RSA PRIVATE KEY-----
```

to this:

```javascript
{
  tag: "RSA PRIVATE KEY"
  base64: "MIIBywIBAAJhAOH/GYm6UPad21b4uEQU3bAJqlP2sDuRCv4I0iThtYT6wcQTXrnxTXQzT24FNpZJ5saVGnyaBxmhnz5F1Pe2/5ERfhRSpfjqMRim8iO8mN5wTuHFEsCZr2voIiPQYgT6HQIDAQABAmBlQ993nWrl9rnv8KbwqsDjPpF56hHxvv5D8kPnjtO9cHcemudZPkzMgqlWzTM2iInuJI1K7kpEh5nDuMv0/RGn31/+IPKBtKDv5HRHAGQE43ByQaKO0Wi/uA3WoH6DhkECMQD8l0YRmJVTQu/8LsO7anCc9H6I/1vNooHJK5r0EnvyjM1Qp2V8FRtZvRrSCtQJp6UCMQDlC/CQE4yQxoIbagJQHSWMzRgdWpJzDPC0gZkqW8AnyHhUMmZsvbMc9BOxQtDqPxkCMQCatNyJsnbjREBQqSPhClRnDajip+TGkh4D5N1HWHrqGCs4lw6lbRgPYq+mrlMohrECMQCbw9/oi3LnrigjLpe+FeRIed3xcHvyBBXaG9ym4tit9XZnhBMF1ohto0uVHCRpeVkCMAy9rpfJodk5DOzPIQ+bwvahjPpadPcD0t1u6LVReHds7mtqn8uYSIKEYzTL/xgbtQ=="
}
```

and back.

## Why?

Passing PKI artifacts around as command line arguments, environment variables, etc. is a pain because of all the spaces and newlines. However, you can't just pass use plain base64 strings because OpenSSL can be picky about formatting.

## Usage

```javascript
var pemstrip = require('pemstrip');
var fs = require('fs');

var fullKey = fs.readFileSync("id_rsa");

# Evaluates to {tag: "RSA PRIVATE KEY", base64: "MIIByw..."}
var stripped = pemstrip.strip(fullKey);

var sanityCheck = pemstrip.assemble({base64: stripped, tag: "RSA PRIVATE KEY"});
```