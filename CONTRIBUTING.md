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

Repository Layout
-----------------

The repository is structured as a pnpm workspace. Workspace setup and linking are handled by `pnpm install`, and the root `postinstall` task builds the packages.

For example, if you want to see the order of packages being processed, you can do:
```
$ pnpm -r --workspace-concurrency=1 --filter './packages/*' exec node -e "console.log(require('./package.json').name)"
inferno-shared
inferno-vnode-flags
inferno-utils
inferno
inferno-clone-vnode
inferno-create-element
inferno-extras
inferno-hyperscript
inferno-test-utils
inferno-animation
inferno-hydrate
inferno-mobx
inferno-redux
inferno-compat
inferno-server
inferno-router
```

Source files are written in TypeScript and tests are written in JS/JSX consuming the dist files.

Running tests
-------------
Always include tests for the functionality you want to add into Inferno. This way we can avoid regression in future.

Make sure you have pnpm available. The repository pins its pnpm version through `packageManager`, so Corepack can provision it for you:

```
corepack enable
```

- Clone the repository.
- Install development dependencies `pnpm install`
- build typescript files `pnpm run build`
- run tests `pnpm run test`


Pull requests
-------------

All pull requests are welcome.

*Caveat for what follows: If in doubt, submit the request - a PR that needs tweaking is infinitely more valuable than a request that wasn't made because you were worrying about meeting these requirements.*

Before submitting, run `pnpm run build` (which will concatenate, lint and test the code) to ensure the build passes - but don't include files from outside the `src` and `test` folders in the PR.

And make sure the PR haven't been published before!

There isn't (yet) a formal style guide for Inferno, so please take care to adhere to existing conventions:

* 2-space indentation, not tabs!
* Semi-colons
* Single-quotes for strings

Above all, code should be clean and readable, and commented where necessary. If you add a new feature, make sure you add a test to go along with it!


Before you commit your changes, please run `pnpm run prettier` to format code correctly

Sauce Labs pull request checks
-----------------------------

The `Tests` workflow runs without Sauce credentials. The separate `Sauce Labs`
workflow runs the complete browser matrix automatically for same-repository pull
requests and pushes to `master`. Fork and Dependabot pull requests require a
maintainer-triggered run because GitHub does not provide Actions secrets to those
pull request workflows.

Before approving a run, a maintainer with repository write access must review the
exact PR head commit, including dependencies, installation scripts, and test code:
the approved code will run with the Sauce credentials during the browser test
step. Obtain the current head with:

```sh
gh pr view PR_NUMBER --repo infernojs/inferno --json headRefOid --jq .headRefOid
```

After reviewing that commit, open **Actions → Sauce Labs → Run workflow**, select
`master`, and enter `pr_number` and the full reviewed `head_sha`. Alternatively:

```sh
gh workflow run sauce-labs.yml --repo infernojs/inferno --ref master \
  -f pr_number=PR_NUMBER -f head_sha=REVIEWED_40_CHARACTER_SHA
```

The workflow rejects stale approvals, closed PRs, and unresolved merge conflicts.
It pins and verifies the test merge of the approved head and current base before
installing dependencies. A later PR push needs a new review and dispatch. Running
the workflow from another branch is rejected; rerunning the ordinary `CI`
workflow does not grant Sauce credentials to a fork.

The `Sauce Labs` **commit status** links to the browser run and is reported on both
the reviewed head and tested merge commit. Browser failures, missing credentials,
and cancelled runs cannot satisfy it. If reporting is interrupted, the status
stays pending; dispatch the reviewed revision again. The informational approval
job and the manual workflow's own job checks do not satisfy this required status.

When first deploying this workflow, merge the workflow and its helpers into
`master` before dispatching it: validation and reporting always use trusted
helpers from `master`. Verify an automatic run and a reviewed fork run, then add
the exact `Sauce Labs` commit status from **GitHub Actions** to `master`'s required
checks. Preserve `Tests`, `coverage/coveralls`, the requirement to be up to date,
and all other branch-protection settings. No job should be named `Sauce Labs`,
because a skipped job with that name could interfere with the required status.

Controller regression tests can be run without Sauce credentials:

```sh
node --test scripts/ci/sauce-workflow.test.mjs
```

Small print
-----------

There's no contributor license agreement - contributions are made on a common sense basis. Inferno is distributed under the MIT license, which means your contributions will be too.

Debugging Browser
-----------------
Just run `pnpm run test:browser:debug` Open localhost:9876 and click debug!

Debugging NodeJS
----------------
Its possible to debug inferno tests by running following command `pnpm run debug` and open chrome web address: chrome://inspect/#devices

Pro tip: You can filter down number of tests by editing `debug` -task:
`node --inspect-brk ./node_modules/.bin/jest {*edit this*} --runInBand --no-cache --no-watchman`
Change parameter to jest to match only files you want to run.
Happy debugging!


## Credits


### Contributors

Thank you to all the people who have already contributed to inferno!
<a href="graphs/contributors"><img src="https://opencollective.com/inferno/contributors.svg?width=890" /></a>


### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/inferno#backer)]

<a href="https://opencollective.com/inferno#backers" target="_blank"><img src="https://opencollective.com/inferno/backers.svg?width=890"></a>


### Sponsors

Thank you to all our sponsors! (please ask your company to also support this open source project by [becoming a sponsor](https://opencollective.com/inferno#sponsor))

<a href="https://opencollective.com/inferno/sponsor/0/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/1/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/2/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/3/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/4/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/5/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/6/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/7/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/8/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/9/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/9/avatar.svg"></a>
