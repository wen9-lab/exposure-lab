# iPhone 原生个人测试版

本项目的 iPhone 目标是 Tauri 2 原生应用，页面与 Windows、Mac、Android 共用计算内核和八章知识库。安装后的页面和计算内容随应用包保存；预设和历史保存在 iPhone 本机。此版本不以 Safari 网页为交付方式。

## 分发限制

Apple 免费个人团队允许通过 Xcode 将应用安装到本人设备；**它不是可向任意 iPhone 发送并直接安装的 IPA**。个人团队配置文件签发后 7 天到期，届时需在 Mac 上重新构建并安装。若将来要通过 TestFlight 或注册设备的 Ad Hoc 方式提供较长期的测试包，需加入付费 Apple Developer Program 并配置对应签名。详见 [Apple 个人团队说明](https://developer.apple.com/help/account/basics/about-your-developer-account)、[Tauri iOS 前置条件](https://v2.tauri.app/start/prerequisites/)。

## 在 Mac 上准备

1. 安装完整 Xcode（仅命令行工具不够），打开一次并完成组件安装。在 Xcode 的设置中用自己的 Apple Account 登录，确认能看到 Personal Team。还需 Node.js、Rust 和 CocoaPods（`brew install cocoapods`）。
2. 在 Mac 上克隆或拉取仓库的 `main`。在 Xcode 的账户页查看个人团队 ID，在终端设置 `export APPLE_DEVELOPMENT_TEAM=你的团队ID`。团队 ID 只用于本机签名；无需发给 Codex，也不要把 Apple 密码、证书私钥或配置文件提交到 GitHub。
3. 在仓库根目录执行 `bash scripts/prepare-ios-mac.sh`。脚本检查 Xcode、CocoaPods、Rust，安装 iOS Rust 目标，运行测试，生成 iOS 工程并打开 Xcode。
4. 在 Xcode 的应用 target 的 Signing & Capabilities 中开启 Automatically manage signing，选择 Personal Team。若提示 Bundle Identifier 不唯一，在本机使用 Xcode 给 iOS target 设置独立 ID，并记录它；后续重新生成工程时须保持同一 ID，才能保留同一应用的本地数据。
5. 通过 USB 连接本人的 iPhone，按提示互相信任。在 Xcode 选择该 iPhone 为运行目标并点击 Run。若 iPhone 提示开发者模式，到“设置 > 隐私与安全性 > 开发者模式”打开并按提示重启、输入设备密码。之后重试 Xcode 的 Run。参见 [Apple 真机运行步骤](https://developer.apple.com/documentation/xcode/building-and-running-an-app)与[开发者模式说明](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device)。
6. 第一次成功启动后断开网络，彻底关闭应用再打开。检查两款计算器、1/3 EV 曝光目标、八章知识库；保存预设、关闭再打开确认留存。再试 JSON 导出与导入。记录设备型号、iOS 版本和结果，供后续验收。

## 当前验证范围

GitHub 的 iOS 模拟器构建工作流仅检查工程生成与无签名编译；模拟器产物不能装到真实 iPhone。真机签名、安装、离线重启、预设与 JSON 备份都需要在用户自己的 Mac/iPhone 上测试，未通过前不计入验收。GitHub 保存源码、课程内容和构建脚本；个人设置、预设、历史及 Apple 凭据不上传。
