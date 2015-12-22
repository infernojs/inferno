@echo off
REM usage:
REM http://stackoverflow.com/questions/9385899/separate-tokens-in-batch-file
REM http://stackoverflow.com/questions/14952295/set-output-of-a-command-as-a-variable-with-pipes/25954264#25954264
REM http://stackoverflow.com/questions/2763875/batch-file-include-external-file-for-variables
REM http://stackoverflow.com/questions/10149194/something-like-a-function-method-in-batch-files/31165500#31165500
setlocal

REM echo DEBUG: dotenv_config_path=%dotenv_config_path%

if "%dotenv_config_path%"=="" (
  REM echo DEBUG: dotenv_config_path empty
  if exist .env (
    REM echo DEBUG: .env exists
    set file=.env
    call:process
  ) else (
    REM echo DEBUG: .env does't exists
    call:usage
  )
) else if exist %dotenv_config_path% (
  REM echo DEBUG: file dotenv_config_path exists
  set file=%dotenv_config_path%
  call:process
) else (
  REM echo DEBUG: file dotenv_config_path doesn't exists
  call:usage
)

EXIT /B %ERRORLEVEL%

:process
echo INFO: Using file "%file%"
echo.
echo INFO: Sourced env variables:
for /f "delims=" %%a in (%file%) do (
    endlocal
    echo INFO:   %%a
    set "%%a"
)
EXIT /B 0

:usage
    echo.
    echo Usage:
    echo   Create file with key=value pairs separated by newline
    echo   Default file name is .env
    echo   You can set it with dotenv_config_path env variable
    echo   Then run:
    echo   'env.bat'

EXIT /B 0
