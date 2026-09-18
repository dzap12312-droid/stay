@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 8842
ping -n 2 127.0.0.1 >nul
start "" http://localhost:8842/index.html
