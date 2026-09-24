@echo off
chcp 65001 >nul
cd /d "%~dp0"

powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$shortcut = $ws.CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), '업무관리.lnk'));" ^
  "$shortcut.TargetPath = (Resolve-Path 'run.bat').Path;" ^
  "$shortcut.WorkingDirectory = (Get-Location).Path;" ^
  "$shortcut.IconLocation = (Resolve-Path 'assets\icon.ico').Path;" ^
  "$shortcut.Save()"

echo.
echo 바탕화면에 "업무관리" 바로가기를 만들었습니다.
echo 이제부터는 바탕화면 아이콘을 더블클릭하면 바로 실행됩니다.
pause
