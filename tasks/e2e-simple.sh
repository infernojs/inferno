#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# ******************************************************************************
# This is an end-to-end test intended to run on CI.
# You can also run it locally but it's slow.
# ******************************************************************************

# Start in tasks/ even if run from root directory
cd "$(dirname "$0")"

# CLI and app temporary locations
# http://unix.stackexchange.com/a/84980
temp_cli_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_cli_path'`
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`

function cleanup {
  echo 'Cleaning up.'
  cd "$root_path"
  # Uncomment when snapshot testing is enabled by default:
  # rm ./packages/react-scripts/template/src/__snapshots__/App.test.js.snap
  rm -rf "$temp_cli_path" $temp_app_path
}

# Error messages are redirected to stderr
function handle_error {
  echo "$(basename $0): ERROR! An error was encountered executing line $1." 1>&2;
  cleanup
  echo 'Exiting with error.' 1>&2;
  exit 1
}

function handle_exit {
  cleanup
  echo 'Exiting without error.' 1>&2;
  exit
}

function create_react_app {
  node "$temp_cli_path"/node_modules/create-react-app/index.js "$@"
}

# Check for the existence of one or more files.
function exists {
  for f in $*; do
    test -e "$f"
  done
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# Echo every command being executed
set -x

# Go to root
cd ..
root_path=$PWD

# Clear cache to avoid issues with incorrect packages being used
if hash yarnpkg 2>/dev/null
then
  # AppVeyor uses an old version of yarn.
  # Once updated to 0.24.3 or above, the workaround can be removed
  # and replaced with `yarnpkg cache clean`
  # Issues:
  #    https://github.com/yarnpkg/yarn/issues/2591
  #    https://github.com/appveyor/ci/issues/1576
  #    https://github.com/facebookincubator/create-react-app/pull/2400
  # When removing workaround, you may run into
  #    https://github.com/facebookincubator/create-react-app/issues/2030
  case "$(uname -s)" in
    *CYGWIN*|MSYS*|MINGW*) yarn=yarn.cmd;;
    *) yarn=yarnpkg;;
  esac
  $yarn cache clean
fi

if hash npm 2>/dev/null
then
  # npm 5 is too buggy right now
  if [ $(npm -v | head -c 1) -eq 5 ]; then
    npm i -g npm@^4.x
  fi;
  npm cache clean || npm cache verify
fi

# Prevent bootstrap, we only want top-level dependencies
cp package.json package.json.bak
grep -v "postinstall" package.json > temp && mv temp package.json
npm install
mv package.json.bak package.json

# We need to install create-react-app deps to test it
cd "$root_path"/packages/create-react-app
npm install
cd "$root_path"

# If the node version is < 6, the script should just give an error.
nodeVersion=`node --version | cut -d v -f2`
nodeMajor=`echo $nodeVersion | cut -d. -f1`
nodeMinor=`echo $nodeVersion | cut -d. -f2`
if [[ nodeMajor -lt 6 ]]
then
  cd $temp_app_path
  err_output=`node "$root_path"/packages/create-react-app/index.js test-node-version 2>&1 > /dev/null || echo ''`
  [[ $err_output =~ You\ are\ running\ Node ]] && exit 0 || exit 1
fi

if [ "$USE_YARN" = "yes" ]
then
  # Install Yarn so that the test can use it to install packages.
  npm install -g yarn
  yarn cache clean
fi

# We removed the postinstall, so do it manually here
node bootstrap.js

# Lint own code
./node_modules/.bin/eslint --max-warnings 0 packages/babel-preset-react-app/
./node_modules/.bin/eslint --max-warnings 0 packages/create-react-app/
./node_modules/.bin/eslint --max-warnings 0 packages/eslint-config-react-app/
./node_modules/.bin/eslint --max-warnings 0 packages/react-dev-utils/
./node_modules/.bin/eslint --max-warnings 0 packages/react-scripts/
cd packages/react-error-overlay/
./node_modules/.bin/eslint --max-warnings 0 src/
npm test
npm run build:prod
cd ../..

# ******************************************************************************
# First, test the create-react-app development environment.
# This does not affect our users but makes sure we can develop it.
# ******************************************************************************

# Test local build command
npm run build
# Check for expected output
exists build/*.html
exists build/static/js/*.js
exists build/static/css/*.css
exists build/static/media/*.svg
exists build/favicon.ico

# Run tests with CI flag
CI=true npm test
# Uncomment when snapshot testing is enabled by default:
# exists template/src/__snapshots__/App.test.js.snap

# Test local start command
npm start -- --smoke-test

# ******************************************************************************
# Next, pack react-scripts and create-react-app so we can verify they work.
# ******************************************************************************

# Pack CLI
cd "$root_path"/packages/create-react-app
cli_path=$PWD/`npm pack`

# Go to react-scripts
cd "$root_path"/packages/react-scripts

# Save package.json because we're going to touch it
cp package.json package.json.orig

# Replace own dependencies (those in the `packages` dir) with the local paths
# of those packages.
node "$root_path"/tasks/replace-own-deps.js

# Finally, pack react-scripts
scripts_path="$root_path"/packages/react-scripts/`npm pack`

# Restore package.json
rm package.json
mv package.json.orig package.json

# ******************************************************************************
# Now that we have packed them, create a clean app folder and install them.
# ******************************************************************************

# Install the CLI in a temporary location
cd "$temp_cli_path"

# Initialize package.json before installing the CLI because npm will not install
# the CLI properly in the temporary location if it is missing.
npm init --yes

# Now we can install the CLI from the local package.
npm install "$cli_path"

# Install the app in a temporary location
cd $temp_app_path
create_react_app --scripts-version="$scripts_path" test-app

# ******************************************************************************
# Now that we used create-react-app to create an app depending on react-scripts,
# let's make sure all npm scripts are in the working state.
# ******************************************************************************

function verify_env_url {
  # Backup package.json because we're going to make it dirty
  cp package.json package.json.orig

  # Test default behavior
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 0 || exit 1

  # Test relative path build
  awk -v n=2 -v s="  \"homepage\": \".\"," 'NR == n {print s} {print}' package.json > tmp && mv tmp package.json

  npm run build
  # Disabled until this can be tested
  # grep -F -R --exclude=*.map "../../static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"./static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  PUBLIC_URL="/anabsolute" npm run build
  grep -F -R --exclude=*.map "/anabsolute/static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  # Test absolute path build
  sed "2s/.*/  \"homepage\": \"\/testingpath\",/" package.json > tmp && mv tmp package.json

  npm run build
  grep -F -R --exclude=*.map "/testingpath/static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  PUBLIC_URL="https://www.example.net/overridetest" npm run build
  grep -F -R --exclude=*.map "https://www.example.net/overridetest/static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1
  grep -F -R --exclude=*.map "testingpath/static" build/ -q; test $? -eq 1 || exit 1

  # Test absolute url build
  sed "2s/.*/  \"homepage\": \"https:\/\/www.example.net\/testingpath\",/" package.json > tmp && mv tmp package.json

  npm run build
  grep -F -R --exclude=*.map "/testingpath/static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  PUBLIC_URL="https://www.example.net/overridetest" npm run build
  grep -F -R --exclude=*.map "https://www.example.net/overridetest/static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1
  grep -F -R --exclude=*.map "testingpath/static" build/ -q; test $? -eq 1 || exit 1

  # Restore package.json
  rm package.json
  mv package.json.orig package.json
}

function verify_module_scope {
  # Create stub json file
  echo "{}" >> sample.json

  # Save App.js, we're going to modify it
  cp src/App.js src/App.js.bak

  # Add an out of scope import
  echo "import sampleJson from '../sample'" | cat - src/App.js > src/App.js.temp && mv src/App.js.temp src/App.js

  # Make sure the build fails
  npm run build; test $? -eq 1 || exit 1
  # TODO: check for error message

  # Restore App.js
  rm src/App.js
  mv src/App.js.bak src/App.js
}

# Enter the app directory
cd test-app

# Test the build
npm run build
# Check for expected output
exists build/*.html
exists build/static/js/*.js
exists build/static/css/*.css
exists build/static/media/*.svg
exists build/favicon.ico

# Run tests with CI flag
CI=true npm test
# Uncomment when snapshot testing is enabled by default:
# exists src/__snapshots__/App.test.js.snap

# Test the server
npm start -- --smoke-test

# Test environment handling
verify_env_url

# Test reliance on webpack internals
verify_module_scope

# ******************************************************************************
# Finally, let's check that everything still works after ejecting.
# ******************************************************************************

# Eject...
echo yes | npm run eject

# ...but still link to the local packages
npm link "$root_path"/packages/babel-preset-react-app
npm link "$root_path"/packages/eslint-config-react-app
npm link "$root_path"/packages/react-dev-utils
npm link "$root_path"/packages/react-scripts

# Test the build
npm run build
# Check for expected output
exists build/*.html
exists build/static/js/*.js
exists build/static/css/*.css
exists build/static/media/*.svg
exists build/favicon.ico

# Run tests, overring the watch option to disable it.
# `CI=true npm test` won't work here because `npm test` becomes just `jest`.
# We should either teach Jest to respect CI env variable, or make
# `scripts/test.js` survive ejection (right now it doesn't).
npm test -- --watch=no
# Uncomment when snapshot testing is enabled by default:
# exists src/__snapshots__/App.test.js.snap

# Test the server
npm start -- --smoke-test

# Test environment handling
verify_env_url

# Test reliance on webpack internals
verify_module_scope

# Cleanup
cleanup
