#!/usr/bin/env bash

trace mute stdout
exec 1>/tmp/out
#ref: https://github.com/rtc-io/webrtc-testing-on-travis
BROWSER=chrome  
BVER=stable


#set -x
#set -e

# Make sure /dev/shm has correct permissions.
ls -l /dev/shm
sudo chmod 1777 /dev/shm
ls -l /dev/shm

# determine the script path
# ref: http://stackoverflow.com/questions/4774054/reliable-way-for-a-bash-script-to-get-the-full-path-to-itself
pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd -P`
popd > /dev/null

mute sudo apt-get update --fix-missing
echo "Getting $BVER version of $BROWSER"

  CHROME=google-chrome-${BVER}_current_amd64.deb
  wget https://dl.google.com/linux/direct/$CHROME
  ( mute sudo dpkg --install $CHROME ) || mute sudo apt-get -f install
  which google-chrome
  ls -l `which google-chrome`

  if [ -f /opt/google/chrome/chrome-sandbox ]; then
    CHROME_SANDBOX=/opt/google/chrome/chrome-sandbox
  else
    CHROME_SANDBOX=$(ls /opt/google/chrome*/chrome-sandbox)
  fi

  # Download a custom chrome-sandbox which works inside OpenVC containers (used on travis).
  sudo rm -f $CHROME_SANDBOX
  sudo wget https://googledrive.com/host/0B5VlNZ_Rvdw6NTJoZDBSVy1ZdkE -O $CHROME_SANDBOX
  sudo chown root:root $CHROME_SANDBOX; sudo chmod 4755 $CHROME_SANDBOX
  sudo md5sum $CHROME_SANDBOX

  google-chrome --version

esac
