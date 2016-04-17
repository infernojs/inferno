#! /bin/bash
# inspired from https://github.com/web-animations/web-animations-js/blob/master/.travis-setup.sh

set -x
set -e

# Make sure /dev/shm has correct permissions.
VERSION="stable"
echo "Getting $VERSION of $BROWSER"
export CHROME=google-chrome-stable_current_amd64.deb
wget https://dl.google.com/linux/direct/$CHROME
sudo dpkg --install $CHROME || sudo apt-get -f install
which google-chrome
ls -l `which google-chrome`

if [ -f /opt/google/chrome/chrome-sandbox ]; then
    export CHROME_SANDBOX=/opt/google/chrome/chrome-sandbox
else
    export CHROME_SANDBOX=$(ls /opt/google/chrome*/chrome-sandbox)
fi

google-chrome --version
