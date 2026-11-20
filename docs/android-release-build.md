# Android 正式版构建说明（macOS / Apple Silicon）

本文记录如何从零重建 0.1.2 **正式签名版** APK。目标是任何人 clone 仓库后，都能用同一套脚本复现出可升级的正式包。配套验收步骤见 [android-release-acceptance.md](android-release-acceptance.md)。

## 与旧调试版的区别

`npm run build:android` 产出的是调试包（包名带 `.debug` 后缀、debug 签名），只适合个人测试。正式版的区别：

| | 调试版 | 正式版 |
|---|---|---|
| 包名 | `io.github.wen9lab.exposurelab.debug` | `io.github.wen9lab.exposurelab` |
| 签名 | Android debug keystore | 专用 release keystore |
| 可升级 | 与正式版互不覆盖 | 同包名同签名可覆盖升级 |
| 构建命令 | `npm run build:android` | 见下文（不带 `--debug`） |

注意：Tauri 2 的 `android build` **没有 `--release` 参数**，不带 `--debug` 即为 release。传 `--release` 会报参数错误。

## 前置条件

- macOS + Apple Silicon，Node 24 / npm
- 约 2 GB 可用磁盘（工具链 + 构建产物）
- **正式版 keystore**（见下一节）——这是发布可升级更新的唯一凭证，丢失后无法为同一应用签名新版本

## 第 1 步：准备工具链

```bash
bash scripts/setup-android-toolchain-mac.sh
```

脚本会在本地目录下载并配置：Corretto JDK 17、Android command-line tools、Rust 1.90 + `aarch64-linux-android` target，再用 sdkmanager 安装 platform 36 / build-tools 36 / NDK 28。所有内容落在工具链目录（默认 `../toolchain`），不污染系统。构建时通过 `source <工具链目录>/env.sh` 一次性导入 `JAVA_HOME` / `ANDROID_HOME` / `NDK_HOME` / `CARGO_HOME` 等变量。

## 第 2 步：准备 release keystore

若无 keystore，用 JDK 的 `keytool` 生成一次（**只生成一次**，之后永久复用）：

```bash
$JAVA_HOME/bin/keytool -genkeypair -v \
  -keystore /absolute/path/to/release.jks \
  -alias exposurelab -keyalg RSA -keysize 2048 -validity 10000 \
  -storetype JKS -storepass '<你的密码>' -keypass '<你的密码>' \
  -dname "CN=Exposure Lab, OU=wen9-lab, O=wen9-lab, L=Personal, ST=Personal, C=CN"
```

把 keystore 放在**仓库外**的安全位置（本仓库 `.gitignore` 已排除密钥文件）。请自行加密备份到网盘或另一台设备——它是这个应用身份的唯一凭证。

## 第 3 步：生成 Android 工程并注入签名配置

`src-tauri/gen/` 被 `.gitignore` 排除，签名配置需每次构建前动态注入：

```bash
cd exposure-lab && npm ci
source <工具链目录>/env.sh

npm run tauri -- android init --ci --skip-targets-install
python3 scripts/prepare-android-release.py \
  --keystore /absolute/path/to/release.jks \
  --store-pass '<你的密码>' --key-alias exposurelab --key-pass '<你的密码>'
```

`prepare-android-release.py` 是幂等的，可重复运行。它做三件事：
- 把 `compileSdk` 固定为 36、`targetSdk` 固定为 35（Tauri 模板默认 37，本机未安装）
- 注入 release `signingConfigs`
- 在 release buildType 上挂载该签名

versionCode 不用手动设置：`tauri.properties` 由 Tauri 自动生成，versionCode 从版本号推导（`0.1.2` → `1002`，即 `minor×1000 + patch`），versionName 取 `Cargo.toml` 的 `version`。

## 第 4 步：构建并核验

```bash
npm run tauri -- android build --apk --target aarch64
```

产物在 `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk`。复制到稳定路径并按正式版命名：

```bash
cp src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk \
   release/ExposureLab-0.1.2-official-arm64.apk
```

用 `apksigner` / `aapt2` 核验（需先 `source` 工具链 env.sh）：

```bash
$ANDROID_HOME/build-tools/36.0.0/apksigner verify --print-certs \
  release/ExposureLab-0.1.2-official-arm64.apk
$ANDROID_HOME/build-tools/36.0.0/aapt2 dump badging \
  release/ExposureLab-0.1.2-official-arm64.apk | grep -E "package:|sdkVersion:|native-code:"
```

期望结果：包名 `io.github.wen9lab.exposurelab`（无 `.debug`）、versionCode 1002、arm64-v8a、minSdk 24 / targetSdk 35 / compileSdk 36、签名证书 SHA256 与 keystore 指纹一致。

## 第 5 步：真机验收

按 [android-release-acceptance.md](android-release-acceptance.md) 执行：安装、断网重开、预设留存、JSON 备份导入导出、A–F 六例计算。若手机装过旧 debug 版，需先卸载并从旧版导出 JSON 再导入正式版（两者不互相覆盖）。

## 已知问题

- 构建结束若后台任务报 failed，但日志出现 `Finished 1 APK at:` 且 apksigner 验证通过，则是沙箱拦截了 Kotlin daemon 在 `~/Library/Application Support/kotlin/daemon/` 清理临时文件，不影响 APK 产物。
- AGP 9 的 `android { }` / `libraryVariants` 弃用警告可忽略，不影响构建。
