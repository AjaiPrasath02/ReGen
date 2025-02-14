@echo off
echo Opening installation windows for Frontend and Backend...

timeout /t 3
start cmd /k "cd frontend && echo Installing Frontend Dependencies... && npm install --legacy-peer-deps && echo Frontend installation complete!"
start cmd /k "cd backend && echo Installing Backend Dependencies... && npm install --legacy-peer-deps && echo Backend installation complete!"

exit