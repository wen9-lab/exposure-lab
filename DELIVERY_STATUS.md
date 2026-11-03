# 交付进度（2026-11-03）

## 已有产物

- 源码、中文 README、计算内核、五个页面、单元与浏览器测试已建立在本目录。
- Windows NSIS 离线安装包已构建：`E:\ExposureLab-Toolchains\target\windows\release\bundle\nsis\Exposure Lab_0.1.0_x64-setup.exe`，构建报告约 209.62 MiB。
- 安装包已复制到 `E:\ExposureLab\output\windows\Exposure Lab_0.1.0_x64-setup.exe`（219,798,282 字节）。
- 2026-11-03 最新复测：单元测试 15/15、浏览器交互测试 5/5、本地与线上浏览器离线缓存测试各 1/1；`npm run build:pages` 成功。离线测试脚本现会先构建 Pages 版本。
- Rust、Cargo、Visual Studio C++ Build Tools 存于 `E:\ExposureLab-Toolchains`。
- 源码快照已提交到本地 `codex/exposure-lab` 分支，并克隆到 `E:\ExposureLab`。
- 源码已推送到 GitHub 公开仓库 `https://github.com/wen9-lab/exposure-lab` 的 `main` 分支。Pages 地址 `https://wen9-lab.github.io/exposure-lab/` 已返回 HTTP 200，Actions 部署成功，Windows Edge 测试了首次缓存后断网刷新与状态保留。
- 默认基准、胶片阳光 16 与 JSON 设备范围校验已修复；新版 Windows 离线安装包已复制到 E 盘交付目录，SHA-256：`0532416E76639A31FF2D3576F19261BFC5110273979BFF83A9D62A51E14AF0C0`。
- Android 官方命令行 SDK 工具已下载并校验 SHA-256，解压于 `E:\ExposureLab-Toolchains\AndroidSDK`。用户已明确同意 SDK 许可并已接受。Microsoft JDK 17 在 E 盘有可运行副本，Android 平台组件下载中。

## 尚需完成

1. 完成 Android SDK 平台、构建工具、NDK 安装，构建并验证可安装的调试签名 APK。
2. 将最新构建脚本、线上验证配置与交付状态推送到 GitHub。
3. 清理本任务在 C 盘新增的重复构建产物与工具安装，保留可恢复的源码直到 E 盘构建通过。
4. 在真实 Windows、Android、Mac、iPhone 设备上分别做离线重启验收；没有实测的项目保持待验证状态。

## 限制

当前 Windows 构建成功不等于目标设备离线安装通过。网页首次访问需联网 HTTPS 加载并缓存；清除网站数据后可能需要重新联网。Mac/iPhone 首版没有原生安装包。
