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
$env:ANDROID_USER_HOME = Join-Path $ToolchainRoot '.android'
$env:ANDROID_SDK_HOME = $ToolchainRoot
New-Item -ItemType Directory -Path $env:ANDROID_USER_HOME -Force | Out-Null
$ndkRoot = Join-Path $sdk 'ndk'
if (Test-Path $ndkRoot) {
  $ndk = Get-ChildItem -LiteralPath $ndkRoot -Directory | Sort-Object Name -Descending | Select-Object -First 1
  if ($ndk) { $env:NDK_HOME = $ndk.FullName; $env:ANDROID_NDK_HOME = $ndk.FullName }
}
$env:GRADLE_USER_HOME = Join-Path $ToolchainRoot 'gradle'
$env:CARGO_HTTP_TIMEOUT = '120'
$env:CARGO_HTTP_LOW_SPEED_LIMIT = '1'
$env:CARGO_NET_RETRY = '5'
$env:TEMP = Join-Path $ToolchainRoot 'temp'
$env:TMP = $env:TEMP
New-Item -ItemType Directory -Path $env:GRADLE_USER_HOME, $env:TEMP -Force | Out-Null
$jbr = Join-Path $ToolchainRoot 'AndroidStudio\jbr'
if (Test-Path $jbr) { $env:JAVA_HOME = $jbr }
$jdk = Join-Path $ToolchainRoot 'JDK17'
if (-not $env:JAVA_HOME -and (Test-Path (Join-Path $jdk 'bin\java.exe'))) { $env:JAVA_HOME = $jdk }
if (-not (Test-Path 'src-tauri\gen\android')) {
  npm run tauri -- android init --ci --skip-targets-install
  if ($LASTEXITCODE -ne 0) { throw 'Android init failed' }
}
$gradleFile = 'src-tauri\gen\android\app\build.gradle.kts'
$gradle = Get-Content -LiteralPath $gradleFile -Raw
if ($gradle -notmatch 'compileSdk\s*=\s*\d+' -or $gradle -notmatch 'targetSdk\s*=\s*\d+') {
  throw 'Android SDK version settings not found'
}
# Tauri's Android library requires compileSdk 36; targetSdk 35 avoids preview API 37 behavior.
$gradle = $gradle -replace 'compileSdk\s*=\s*\d+', 'compileSdk = 36'
$gradle = $gradle -replace 'targetSdk\s*=\s*\d+', 'targetSdk = 35'
Set-Content -LiteralPath $gradleFile -Value $gradle -NoNewline
npm run tauri -- android build --apk --target aarch64 --debug
if ($LASTEXITCODE -ne 0) { throw 'Android build failed' }
$destination = Join-Path (Get-Location) 'output\android'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
Get-ChildItem 'src-tauri\gen\android\app\build\outputs\apk' -Filter '*.apk' -Recurse | Copy-Item -Destination $destination -Force
Write-Host "Android APK: $destination"
