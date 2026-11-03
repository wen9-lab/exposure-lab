param([string]$ToolchainRoot = 'E:\ExposureLab-Toolchains')
$ErrorActionPreference = 'Stop'
$cargoBin = Join-Path $ToolchainRoot 'cargo\bin'
if (Test-Path (Join-Path $cargoBin 'cargo.exe')) {
  $env:RUSTUP_HOME = Join-Path $ToolchainRoot 'rustup'
  $env:CARGO_HOME = Join-Path $ToolchainRoot 'cargo'
  $env:CARGO_TARGET_DIR = Join-Path $ToolchainRoot 'target\android'
  $env:PATH = "$cargoBin;$env:PATH"
}
$sdk = Join-Path $ToolchainRoot 'AndroidSDK'
if (Test-Path $sdk) { $env:ANDROID_HOME = $sdk; $env:ANDROID_SDK_ROOT = $sdk }
$jbr = Join-Path $ToolchainRoot 'AndroidStudio\jbr'
if (Test-Path $jbr) { $env:JAVA_HOME = $jbr }
if (-not (Test-Path 'src-tauri\gen\android')) {
  npm run tauri -- android init --ci
  if ($LASTEXITCODE -ne 0) { throw 'Android 初始化失败' }
}
npm run tauri -- android build --apk --target aarch64
if ($LASTEXITCODE -ne 0) { throw 'Android 构建失败' }
$destination = Join-Path (Get-Location) 'output\android'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
Get-ChildItem 'src-tauri\gen\android\app\build\outputs\apk' -Filter '*.apk' -Recurse | Copy-Item -Destination $destination -Force
Write-Host "Android APK: $destination"
