Contributing to Inferno
==========================

Many thanks for using Inferno and contributing to its development. The following is a quick set of guidelines designed to maximise your contribution's effectiveness.


Got a question or need help?
----------------------------

If you're having trouble getting Inferno to do what you want, there are a couple of places to get help before submitting an issue:

* [Stack Overflow questions tagged infernojs](http://stackoverflow.com/questions/tagged/infernojs)

Of course, if you've encountered a bug, then the best course of action is to raise an issue (if no-one else has!).

Reporting security vulnerabilities
----------------------------------

If you think you've found a security vulnerability, please email [Dominic Gannaway](mailto:dg@domgan.com) with details, and he will respond to you if he isn't at work by that time.



Pull requests
-------------


**Pull requests against the master branch will not be merged!**

All pull requests are welcome. You should create a new branch, based on the [dev branch](https://github.com/trueadm/inferno/tree/dev), and submit the PR against the dev branch.

*Caveat for what follows: If in doubt, submit the request - a PR that needs tweaking is infinitely more valuable than a request that wasn't made because you were worrying about meeting these requirements.*

Before submitting, run `npm run build` (which will concatenate, lint and test the code) to ensure the build passes - but don't include files from outside the `src` and `test` folders in the PR.

And make sure the PR haven't been published before!

There isn't (yet) a formal style guide for Inferno, so please take care to adhere to existing conventions:

* Tabs, not spaces!
* Semi-colons
* Single-quotes for strings

Above all, code should be clean and readable, and commented where necessary. If you add a new feature, make sure you add a test to go along with it!


Small print
-----------

There's no contributor license agreement - contributions are made on a common sense basis. Inferno is distributed under the MIT license, which means your contributions will be too.
