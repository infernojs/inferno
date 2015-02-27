browserify-rsa
====
[![Build Status](https://travis-ci.org/calvinmetcalf/browserify-rsa.svg)](https://travis-ci.org/calvinmetcalf/browserify-rsa)

RSA private decryption/signing using chinese remainder and blinding.

API
====

Give it a message as a buffer, a private key (as decoded by https://www.npmjs.com/package/parse-asn1) and a crypto object (aka `require('crypto')`, this is because we use it in browserify crypto and don't want to create a circular dependency)