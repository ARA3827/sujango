@echo off
chcp 65001 > nul
title ArtFlow - 1인 예술가 AI 행정 비서 (Port 5198)

echo ========================================================
echo   ArtFlow (아트플로우) - Ara Agent Lab
echo   1인 예술가를 위한 AI 행정 비서 & 정산 워크스테이션
echo   고유 포트: http://127.0.0.1:5198
echo ========================================================
echo.

:: 5198 포트 충돌 방지: 기존 점유 프로세스 정리
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5198" ^| find "LISTENING"') do (
    echo [알림] 기존 5198 포트 프로세스(PID: %%a)를 안전하게 종료합니다...
    taskkill /f /pid %%a > nul 2>&1
)

echo.
echo [1/2] ArtFlow 로컬 서버를 구동합니다...
start /b cmd /c "npm run dev"

echo [2/2] 브라우저를 실행합니다...
timeout /t 3 /nobreak > nul
start http://127.0.0.1:5198

echo.
echo ========================================================
echo   ArtFlow가 정상적으로 실행되었습니다!
echo   종료하려면 이 창을 닫아주세요.
echo ========================================================
pause
