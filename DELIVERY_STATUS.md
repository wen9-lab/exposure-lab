# 交付状态（2026-11-09）

## 当前版本与 GitHub

- 0.1.2 功能源码、八章知识库、测试和构建配置位于 E:\ExposureLab。公开仓库：https://github.com/wen9-lab/exposure-lab。GitHub 默认分支同步状态以本文件下次核对的远端提交为准。
- 1/3 EV 曝光目标修正在两款计算器中使用精确三分之一档内部值，界面显示 0、±0.3、±0.7、±1 等近似读数；完整档计算器达不到目标时显示残差。Windows 0.1.2 已本机安装启动。
- GitHub Pages 旧网页保留为独立历史交付，不再作为 iPhone 交付物；Pages 工作流改为手动触发，以免默认分支同步时自动发布未经要求的网页版更新。应用的个人设置、预设和历史不上传 GitHub。

## 已生成的安装产物

- Windows x64 NSIS 0.1.2 离线安装包：E:\ExposureLab\output\windows\Exposure Lab_0.1.2_x64-setup.exe，SHA-256 C9A871C75826F3AF53C5243952A04A078E4DB4E1FB1F66E218E6015CA5736B58。包含 WebView2 离线组件。本机安装器退出码 0，E:\ExposureLab-App 程序版本 0.1.2，启动窗口标题为“摄影曝光实验室”。缺少 WebView2 的断网 Windows 真机未测试。
- Mac Apple Silicon 0.1.2 个人测试版：GitHub Actions https://github.com/wen9-lab/exposure-lab/actions/runs/42561692781 成功；本机镜像 E:\ExposureLab\output\macos\ExposureLab_0.1.2_macos_arm64.dmg，SHA-256 B75FC96E8AF5277E0D77D9C6B256BEC01E2A82CE4D6065532D6496A2B40FE368；.app ZIP SHA-256 4F01B095AA0988B190DD3ED9B0AD18EC5C272BE36BF2CE913E9741D4EB547DDD。用户已反馈“mac目前适配没有问题”；断网重开、预设和 JSON 备份的具体结果尚未收到。
- Android ARM64 0.1.2 调试签名 APK：E:\ExposureLab\output\android\ExposureLab_0.1.2_arm64-debug.apk，137,242,044 字节，SHA-256 B1C6A286FF31E2EE32EE0789D1B5E094B3E7EC4CBAE4784BDA325DC82D48CE2A。apksigner v2 验证通过；包名 io.github.wen9lab.exposurelab.debug，versionCode 1002、versionName 0.1.2、min API 24、target API 35、compile API 36，仅含 arm64-v8a 原生库。调试证书 SHA-256 D0EFDD...B79BB69A 与 0.1.1 一致，可按同包名同签名升级；真机升级仍待验证。
- Android 构建工具、SDK、JDK、Gradle、Rust、NDK 和缓存均在 E:\ExposureLab-Toolchains。Windows 缺少符号链接权限时，脚本自动使用 Gradle 打包已编译原生库。

## iPhone 原生个人测试版

- 用户已明确改为原生应用，不再以离线网页作为 iPhone 交付。代码共用现有 Tauri 2 和计算内核。
- iOS 工程仅能在 Mac 上由完整 Xcode 生成和编译。本仓库准备了 scripts/prepare-ios-mac.sh、docs/ios-personal-test.md 与 GitHub Actions 无签名模拟器构建工作流；模拟器构建结果与真机状态须单独记录。
- 免费 Apple Account 的 Personal Team 可通过 Xcode 安装到本人的 iPhone；配置文件 7 天到期，需重新构建安装。不能把 Mac 的 DMG/APP 分发方式直接套用到 iPhone。物理 iPhone 的签名、安装、断网重开、预设与 JSON 备份尚未验证。

## 自动测试与待验收

- Windows 0.1.2 改动时计算单元测试 18/18、浏览器交互测试 14/14 通过；本轮提交前会重新运行。
- Windows：用户确认补偿控件与计算结果；在缺少 WebView2 的实际设备上断网安装、重启检查。
- Android：用户当前无法连接手机；需真机安装、断网重开、计算与预设保留检查。
- Mac：用户确认适配正常；需明确断网重开、预设和 JSON 备份的结果。
- iPhone：需在用户的 Mac + iPhone 上用 Xcode Personal Team 签名安装，再做上述离线与数据验收。未在真实设备上通过的项目不计入完成验收。

## 0.1.1 历史

- 0.1.1 八章离线知识库、Windows 离线安装包、Android ARM64 调试 APK 和 GitHub Pages 网页已交付；历史细节保留在 Git 提交中。网页首次访问需要 HTTPS 与网络，浏览器清除网站数据后可能需要重新联网。用户已不将网页作为 iPhone 方案。
