@echo off
echo Starting Frontend and Backend servers...

start cmd /k "cd frontend && npm run dev"
start cmd /k "cd backend && npm start"
timeout /t 3
start chrome --profile-directory="Profile 1" http://localhost:3000/
timeout /t 3

exit