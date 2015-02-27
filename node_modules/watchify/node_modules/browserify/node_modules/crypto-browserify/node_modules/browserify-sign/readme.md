browserify-sign [![Build Status](https://travis-ci.org/calvinmetcalf/browserify-sign.svg)](https://travis-ci.org/calvinmetcalf/browserify-sign)
===

a package to duplicate the functionality of node's crypto public key functions, much of this is based on [Fedor Indutny's](https://github.com/indutny) work on [tls.js](https://github.com/indutny/tls.js).

# done

- basic rsa signing and verifying with the right api

# todo

- ~~tests to make sure we actually did it~~
- ~~chinese remainder theorom?~~
- ~~eliptical curve signing~~
- ~~publicEncrypt and privateDecrypt?~~ (out of scope)
- ~~other key encodings (non rss format public keys)~~
- dsa keys?
- ~~keys with passwords~~