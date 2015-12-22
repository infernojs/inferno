#!/bin/bash
# http://stackoverflow.com/questions/3601515/how-to-check-if-a-variable-is-set-in-bash/

function process() {
    echo "INFO: Using file '${file}'"
    echo
    echo "INFO: Sourced env variables:"
    while read -r line; do
        echo "INFO:   ${line}"
        export "$line"
    done < "$file"
}

function usage() {
    echo
    echo Usage:
    echo "  Create file with key=value pairs separated by newline"
    echo "  Default file name is .env"
    echo "  You can set it with dotenv_config_path env variable"
    echo "  Then run:"
    echo "  'env.bat'"
}

if [ -z ${dotenv_config_path+x} ]; then
  #echo "DEBUG: dotenv_config_path unset"
  if [ -f .env ]; then
      #echo "DEBUG: .env exists"
      file=.env
      process
  else
      #echo "DEBUG: .env does't exists"
      usage
  fi
elif  [ -f "$dotenv_config_path" ]; then
    #echo "DEBUG: file dotenv_config_path exists"
    file=$dotenv_config_path
    process
else
    #echo "DEBUG: file dotenv_config_path=${dotenv_config_path} doesn't exists"
    usage
fi

