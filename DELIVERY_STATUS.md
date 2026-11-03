# 交付进度（2026-11-03）

## 已有产物

- 源码、中文 README、计算内核、五个页面、单元与浏览器测试已建立在本目录。
- Windows NSIS 离线安装包已构建：`E:\ExposureLab-Toolchains\target\windows\release\bundle\nsis\Exposure Lab_0.1.0_x64-setup.exe`，构建报告约 209.62 MiB。
- 安装包已复制到 `E:\ExposureLab\output\windows\Exposure Lab_0.1.0_x64-setup.exe`（219,798,282 字节）。
- 2026-11-03 最新复测：单元测试 15/15、浏览器交互测试 5/5、浏览器离线缓存测试 1/1；`npm run build:pages` 成功。离线测试脚本现会先构建 Pages 版本。
- Rust、Cargo、Visual Studio C++ Build Tools 存于 `E:\ExposureLab-Toolchains`。
- 源码快照已提交到本地 `codex/exposure-lab` 分支，并克隆到 `E:\ExposureLab`。
- 源码已推送到 GitHub 公开仓库 `https://github.com/wen9-lab/exposure-lab` 的 `main` 分支；首次推送的提交为 `d2f1660`。Pages 已通过 API 启用为 `workflow`，网页地址为 `https://wen9-lab.github.io/exposure-lab/`，部署仍待验证。
- 默认基准、胶片阳光 16 与 JSON 设备范围校验已修复；新版 Windows 离线安装包构建成功，待复制到 E 盘交付目录。
- Android 官方命令行 SDK 工具已下载并校验 SHA-256，解压于 `E:\ExposureLab-Toolchains\AndroidSDK`。用户已明确同意 SDK 许可；Microsoft JDK 下载中。

## 尚需完成

1. 复制最新版 Windows 安装包到 E 盘交付目录，并确认文件哈希。
2. 安装 JDK 和 Android SDK 平台、构建工具、NDK，构建并验证 Android APK。
3. 推送最新源码以触发 Pages 工作流，确认 Actions 成功以及 HTTPS 网页可访问、可缓存。
4. 在真实 Windows、Android、Mac、iPhone 设备上分别做离线重启验收；没有实测的项目保持待验证状态。

## 限制

当前 Windows 构建成功不等于目标设备离线安装通过。网页首次访问需联网 HTTPS 加载并缓存；清除网站数据后可能需要重新联网。Mac/iPhone 首版没有原生安装包。
