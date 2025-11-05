<#
run-mkcert.ps1
Creates mkcert certificates for the project and moves them to traefik/certs.
Run in PowerShell from the repository root (or provide -RepoRoot).
#>
param(
    [string]$RepoRoot = (Get-Location).ProviderPath
)

function Fail([string]$msg){ Write-Error $msg; exit 1 }

Write-Host "Repository root: $RepoRoot"

# Check mkcert
$mkcert = Get-Command mkcert -ErrorAction SilentlyContinue
if (-not $mkcert) {
    Fail "mkcert not found on PATH. Install mkcert (choco install mkcert | scoop install mkcert) or put mkcert.exe on your PATH."
}

Write-Host "mkcert executable: $($mkcert.Source)"

# Version
try {
    & mkcert -version
} catch {
    Write-Warning "Failed to run mkcert -version: $_"
}

# Show CA root
try {
    $caroot = (& mkcert -CAROOT).Trim()
    Write-Host "mkcert CA root: $caroot"
} catch {
    Write-Warning "Failed to get mkcert CAROOT: $_"
}

# Ensure CA installed (mkcert -install is idempotent)
Write-Host "Ensuring local CA is installed (may prompt for UAC)..."
try {
    & mkcert -install
} catch {
    Write-Warning "mkcert -install failed or was interrupted: $_"
}

# Generate certificate
$names = @(
    '*.localhost',
    'traefik.localhost',
    'app.localhost',
    'backend.localhost',
    'postgres.localhost',
    'auth.localhost',
    'processor.localhost',
    'localhost',
    '127.0.0.1',
    '::1'
)

Write-Host "Creating certificate for: $($names -join ', ')"
try {
    # Run mkcert with the array of names
    & mkcert @names
} catch {
    Fail "mkcert failed to create certificates: $_"
}

# Find the most-recent cert/key generated
$cert = Get-ChildItem -Path $RepoRoot -Filter '*localhost*.pem' -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike '*-key.pem' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$key  = Get-ChildItem -Path $RepoRoot -Filter '*-key.pem' -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $cert -or -not $key) {
    Write-Warning "Could not automatically find the generated certificate and/or key in $RepoRoot. List PEM files here:"
    Get-ChildItem -Path $RepoRoot -Filter '*.pem' -File | ForEach-Object { Write-Host $_.FullName }
    Fail "Please run the mkcert command manually and move the generated files into traefik/certs as cert.pem and key.pem."
}

# Create traefik/certs
$destDir = Join-Path $RepoRoot 'traefik\certs'
New-Item -ItemType Directory -Path $destDir -Force | Out-Null

# Move and rename
try {
    $destCert = Join-Path $destDir 'cert.pem'
    $destKey  = Join-Path $destDir 'key.pem'
    Move-Item -Path $cert.FullName -Destination $destCert -Force
    Move-Item -Path $key.FullName -Destination $destKey -Force
    Write-Host "Moved cert -> $destCert"
    Write-Host "Moved key  -> $destKey"
} catch {
    Fail "Failed to move/rename cert/key: $_"
}

Write-Host "Done. You can now run 'docker-compose up' to start services. If Traefik fails to load certs, check permissions and paths."
