@echo off
REM Run the BDD test suite and retry analyser (Windows)
node tests/Routine/run-tests.mjs
echo.
echo Done. Press any key to exit...
pause >nul