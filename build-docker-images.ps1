# build-docker-images.ps1
# Builds the docker images for the project

Write-Host "Starting to build the docker images..." -ForegroundColor Green

# Build UI types first
Write-Host "Building types for ui from auth and backend" -ForegroundColor Cyan
Push-Location auth
bun x tsc -p tsconfig.json
Pop-Location

Push-Location backend
bun x tsc -p tsconfig.json
Pop-Location

Write-Host "Done building types" -ForegroundColor Cyan

# Build Docker images
Write-Host "building project-auth:dev..." -ForegroundColor Yellow
docker build -f auth/Dockerfile -t project-auth:dev auth/
if ($LASTEXITCODE -ne 0) { Write-Error "project-auth:dev BUILD FAILED"; exit 1 }
Write-Host "project-auth:dev DONE" -ForegroundColor Green

Write-Host "building project-backend:dev..." -ForegroundColor Yellow
docker build -f backend/Dockerfile -t project-backend:dev backend/
if ($LASTEXITCODE -ne 0) { Write-Error "project-backend:dev BUILD FAILED"; exit 1 }
Write-Host "project-backend:dev DONE" -ForegroundColor Green

Write-Host "building project-ui:dev..." -ForegroundColor Yellow
docker build -f ui/Dockerfile -t project-ui:dev .
if ($LASTEXITCODE -ne 0) { Write-Error "project-ui:dev BUILD FAILED"; exit 1 }
Write-Host "project-ui:dev DONE" -ForegroundColor Green

Write-Host "building project-processor:dev..." -ForegroundColor Yellow
$env:DOCKER_BUILDKIT = "1"
docker build -f processor/Dockerfile -t project-processor:dev processor/
if ($LASTEXITCODE -ne 0) { Write-Error "project-processor:dev BUILD FAILED"; exit 1 }
Write-Host "project-processor:dev DONE" -ForegroundColor Green

Write-Host "`nAll Docker images built successfully!" -ForegroundColor Green
