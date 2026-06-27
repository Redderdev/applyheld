@echo off
echo === Bewerbungstool - Installation ===
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo FEHLER: Python nicht gefunden.
    echo Bitte Python installieren: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Python gefunden. Pakete werden installiert...
echo.
pip install -r requirements.txt

echo.
echo === Installation abgeschlossen! ===
echo Starte das Tool mit: start.bat
pause
