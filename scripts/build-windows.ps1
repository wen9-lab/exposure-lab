param([string]$ToolchainRoot = 'E:\ExposureLab-Toolchains')
$ErrorActionPreference = 'Stop'
$cargoBin = Join-Path $ToolchainRoot 'cargo\bin'
if (Test-Path (Join-Path $cargoBin 'cargo.exe')) {
  $env:RUSTUP_HOME = Join-Path $ToolchainRoot 'rustup'
  $env:CARGO_HOME = Join-Path $ToolchainRoot 'cargo'
  $env:CARGO_TARGET_DIR = Join-Path $ToolchainRoot 'target\windows'
  $env:PATH = "$cargoBin;$env:PATH"
}
npm run build:windows
if ($LASTEXITCODE -ne 0) { throw 'Windows build failed' }
$bundleRoot = if ($env:CARGO_TARGET_DIR) { Join-Path $env:CARGO_TARGET_DIR 'release\bundle\nsis' } else { 'src-tauri\target\release\bundle\nsis' }
$destination = Join-Path (Get-Location) 'output\windows'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
Copy-Item -Path (Join-Path $bundleRoot '*-setup.exe') -Destination $destination -Force
Write-Host "Windows installer: $destination"
