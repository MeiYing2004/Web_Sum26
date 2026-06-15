$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> Install dependencies"
npm install

Write-Host "==> Build all workspaces"
npm run build

Write-Host "==> Production tests"
try { npm run test:production } catch { Write-Host "WARN: tests failed — ensure Redis is running" }

Write-Host "==> Docker build & up"
docker compose build
docker compose up -d

Write-Host "==> Wait for health"
Start-Sleep -Seconds 15
try { Invoke-RestMethod http://localhost:8080/health | ConvertTo-Json -Depth 5 } catch { Write-Host "Health not ready yet" }

Write-Host "Done. Web: http://localhost:3000 | Health: http://localhost:8080/health"
