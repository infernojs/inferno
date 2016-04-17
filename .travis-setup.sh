#! /bin/bash
# inspired from https://github.com/web-animations/web-animations-js/blob/master/.travis-setup.sh

set -x
set -e

# Make sure /dev/shm has correct permissions.
ls -l /dev/shm
sudo chmod 1777 /dev/shm
ls -l /dev/shm
sudo ln -sf $(which true) $(which xdg-desktop-menu)
VERSION="stable"
echo "Getting $VERSION of $BROWSER"
export CHROME=google-chrome-${VERSION}_current_amd64.deb
wget https://dl.google.com/linux/direct/$CHROME
sudo dpkg --install $CHROME || sudo apt-get -f install
which google-chrome
ls -l `which google-chrome`

if [ -f /opt/google/chrome/chrome-sandbox ]; then
    export CHROME_SANDBOX=/opt/google/chrome/chrome-sandbox
else
    export CHROME_SANDBOX=$(ls /opt/google/chrome*/chrome-sandbox)
fi

# Download a custom chrome-sandbox which works inside OpenVC containers (used on travis).
sudo rm -f $CHROME_SANDBOX
sudo wget https://googledrive.com/host/0B5VlNZ_Rvdw6NTJoZDBSVy1ZdkE -O $CHROME_SANDBOX
sudo chown root:root $CHROME_SANDBOX; sudo chmod 4755 $CHROME_SANDBOX
sudo md5sum $CHROME_SANDBOX

google-chrome --version
