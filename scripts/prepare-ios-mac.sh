#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "请在 Mac 上运行此脚本。" >&2
  exit 1
fi

xcodebuild -version
if ! command -v pod >/dev/null 2>&1; then
  echo "请先安装 CocoaPods：brew install cocoapods" >&2
  exit 1
fi
if ! command -v rustup >/dev/null 2>&1; then
  echo "请先安装 Rust 工具链。" >&2
  exit 1
fi
if [[ -z "${APPLE_DEVELOPMENT_TEAM:-}" ]]; then
  echo "请先在 Xcode 登录 Personal Team，然后设置 APPLE_DEVELOPMENT_TEAM。" >&2
  exit 1
fi
rustup target add aarch64-apple-ios aarch64-apple-ios-sim
npm ci
npm test
npm run tauri -- ios init --ci
echo "iOS 工程已生成。请按 docs/ios-personal-test.md 在 Xcode 中选择 Personal Team 并安装到自己的 iPhone。"
npm run tauri -- ios build --open
