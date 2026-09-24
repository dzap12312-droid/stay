@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "node_modules" (
  echo 처음 실행이라 필요한 프로그램을 설치합니다. 몇 분 걸릴 수 있습니다...
  call npm install
  if errorlevel 1 (
    echo.
    echo 설치에 실패했습니다. Node.js가 설치되어 있는지 확인하세요: https://nodejs.org
    pause
    exit /b 1
  )
)

call npm start
if errorlevel 1 (
  echo.
  echo 실행 중 오류가 발생했습니다.
  pause
)
