# Android 0.1.2、iPhone 原生个人测试版与 GitHub 同步

**目标**：Android 提供 0.1.2 ARM64 调试 APK；iPhone 采用 Tauri 原生应用并在用户自己的 Mac、iPhone 上由 Xcode Personal Team 签名安装；GitHub 默认分支同步 0.1.2 源码与课程内容。

## 已核实的边界

- Apple 免费个人团队可以在自己的 iPhone 上用 Xcode 测试应用，但配置文件 7 天到期，需要重新构建和安装。它不提供 Mac DMG 那样可直接下载运行的 iPhone 独立分发，也不支持 TestFlight。
- iOS 工程生成与编译只可在 Mac + 完整 Xcode 上进行。Windows 无法代替用户在 Mac 上选个人团队、信任设备和打开开发者模式。
- Android 真机暂时无法连接。APK 静态验证可完成；安装、断网重启与预设保留必须标为待验证。
- 用户只要求 GitHub 同步代码、内容和版本；不要新增问题记录功能。
- 旧 GitHub Pages 网页保留现状，但不再作为 iPhone 交付物，也不随 main 自动发布。

## 任务与验收

1. 核对 Android 0.1.2 APK 的签名、包名、版本、ABI 和 SHA-256；对照 0.1.1 证书。真机测试待用户设备。
2. 加入 Mac 上初始化 iOS 工程的脚本与中文操作说明；加入无 Apple 凭据的 iOS 模拟器 CI 构建，确认原生工程能编译。物理 iPhone 安装必须由用户在 Mac 的 Xcode 中完成。
3. 更新 README 和交付状态，运行已有计算/浏览器测试；关闭 Pages 的 main 自动部署；将同一源码提交同步至 GitHub 默认分支。核对远端提交与工作流结果。
4. 集中列出用户需要做的事情：iPhone 连接 Mac、Xcode 登录个人团队与开发者模式；Android 真机安装及断网验收；Windows 缺少 WebView2 的断网设备验收。
