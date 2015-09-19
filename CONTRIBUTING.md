# Contributing to Inferno

We would love contributers!

### `master` is unsafe

We will do our best to keep `master` in good shape, with tests passing at all times. But in order to move fast, we will make API changes that your application might not be compatible with. We will do our best to communicate these changes and always version appropriately so you can lock into a specific version if need be.

### Pull Requests

We will be monitoring for pull requests. When we get one, we'll run it locally and run tests on it first. From here, we'll need to get another person to sign off on the changes and then merge the pull request. For API changes we may need to fix internal uses, which could cause some delay. We'll do our best to provide updates and feedback throughout the process.

*Before* submitting a pull request, please make sure the following is done:

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests!
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes (`gulp` or `gulp test`).
5. Make sure your code lints (`gulp lint`)
6. If you haven't already, complete the CLA.

## Bugs

### Where to Find Known Issues

We will be using GitHub Issues for our public bugs. We will keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new task, try to make sure your problem doesn't already exist.

### Reporting New Issues

The best way to get your bug fixed is to provide a reduced test case. jsFiddle, jsBin, and other sites provide a way to give live examples. Those are especially helpful though may not work for `JSX`-based code.

## How to Get in Touch

### Documentation

* Do not wrap lines at 80 characters

## License

By contributing to Inferno, you agree that your contributions will be licensed under its MPL-2.0license.
