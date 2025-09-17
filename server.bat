@echo off

REM Tenta usar Node.js do PATH padrão primeiro
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js não encontrado no PATH, usando caminho específico
    set "PATH=C:\Users\327887\Downloads\nodejs;%PATH%"
) else (
    echo Usando Node.js do PATH padrão
)

npm run dev
