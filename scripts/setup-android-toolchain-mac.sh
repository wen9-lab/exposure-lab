#!/usr/bin/env bash
# 在 Apple Silicon Mac 上准备 Exposure Lab 的 Android 构建工具链（本地目录，不污染系统）
# 用法: bash scripts/setup-android-toolchain-mac.sh
set -euo pipefail

# 工具链默认放在仓库同级的 toolchain/ 目录；也可通过第一个参数覆盖
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${1:-$(cd "$SCRIPT_DIR/.." && pwd)/../toolchain}"
mkdir -p "$ROOT"/{downloads,jdk,android-sdk,cargo,rustup,.android}

echo "== 1/4 下载 JDK 17 (Corretto) =="
if [ ! -f "$ROOT/downloads/corretto17.tar.gz" ]; then
  curl -L --retry 3 -o "$ROOT/downloads/corretto17.tar.gz" \
    "https://corretto.aws/downloads/latest/amazon-corretto-17-aarch64-macos-jdk.tar.gz"
fi

echo "== 2/4 下载 Android commandline tools =="
if [ ! -f "$ROOT/downloads/cmdline-tools.zip" ]; then
  curl -L --retry 3 -o "$ROOT/downloads/cmdline-tools.zip" \
    "https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
fi

echo "== 3/4 解压 JDK 与 SDK tools =="
[ -d "$ROOT/jdk/amazon-corretto-17.jdk" ] || tar -xzf "$ROOT/downloads/corretto17.tar.gz" -C "$ROOT/jdk"
if [ ! -f "$ROOT/android-sdk/cmdline-tools/latest/bin/sdkmanager" ]; then
  (cd "$ROOT/android-sdk" && unzip -q ../downloads/cmdline-tools.zip && \
   mkdir -p cmdline-tools/latest && \
   mv cmdline-tools/bin cmdline-tools/lib cmdline-tools/source.properties cmdline-tools/NOTICE.txt cmdline-tools/latest/)
fi

echo "== 4/4 安装 Rust 1.90 + Android target =="
if [ ! -f "$ROOT/cargo/bin/rustup" ]; then
  curl -L --retry 3 -o "$ROOT/downloads/rustup-init" \
    "https://static.rust-lang.org/rustup/dist/aarch64-apple-darwin/rustup-init"
  chmod +x "$ROOT/downloads/rustup-init"
  CARGO_HOME="$ROOT/cargo" RUSTUP_HOME="$ROOT/rustup" \
    "$ROOT/downloads/rustup-init" -y --no-modify-path --profile minimal --default-toolchain 1.90.0
fi
CARGO_HOME="$ROOT/cargo" RUSTUP_HOME="$ROOT/rustup" \
  "$ROOT/cargo/bin/rustup" target add aarch64-linux-android

echo "== 安装 Android SDK 组件 =="
export JAVA_HOME="$ROOT/jdk/amazon-corretto-17.jdk/Contents/Home"
export ANDROID_HOME="$ROOT/android-sdk" ANDROID_SDK_ROOT="$ANDROID_HOME"
export ANDROID_USER_HOME="$ROOT/.android" ANDROID_SDK_HOME="$ROOT"
mkdir -p "$ANDROID_USER_HOME"
yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null 2>&1 || true
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --install \
  "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;28.0.12916984"

echo "== 生成 env.sh（不含密钥，路径由本脚本推导）=="
cat > "$ROOT/env.sh" <<EOF
# Exposure Lab Android 构建环境（由 setup-android-toolchain-mac.sh 生成）
# 用法: source $ROOT/env.sh

export TOOLCHAIN_ROOT="$ROOT"
export JAVA_HOME="\$TOOLCHAIN_ROOT/jdk/amazon-corretto-17.jdk/Contents/Home"
export ANDROID_HOME="\$TOOLCHAIN_ROOT/android-sdk"
export ANDROID_SDK_ROOT="\$ANDROID_HOME"
export ANDROID_USER_HOME="\$TOOLCHAIN_ROOT/.android"
export ANDROID_SDK_HOME="\$TOOLCHAIN_ROOT"
export NDK_HOME="\$ANDROID_HOME/ndk/28.0.12916984"
export ANDROID_NDK_HOME="\$NDK_HOME"
export CARGO_HOME="\$TOOLCHAIN_ROOT/cargo"
export RUSTUP_HOME="\$TOOLCHAIN_ROOT/rustup"
export CARGO_TARGET_DIR="\$TOOLCHAIN_ROOT/target/android"
export PATH="\$JAVA_HOME/bin:\$CARGO_HOME/bin:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools:\$PATH"

echo "Exposure Lab Android env loaded"
echo "  JAVA_HOME=\$JAVA_HOME"
echo "  ANDROID_HOME=\$ANDROID_HOME"
echo "  NDK_HOME=\$NDK_HOME"
EOF

echo "== 完成 =="
echo "工具链根目录: $ROOT"
echo "之后运行: source $ROOT/env.sh"
echo "注意: 密钥信息通过 prepare-android-release.py 的命令行参数传入，不要写进 env.sh 或提交到仓库。"
