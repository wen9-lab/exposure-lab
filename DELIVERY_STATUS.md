# 交付进度（2026-11-03）

## 已有产物

- 源码、中文 README、计算内核、五个页面、单元与浏览器测试已建立在本目录。
- Windows NSIS 离线安装包已构建：`E:\ExposureLab-Toolchains\target\windows\release\bundle\nsis\Exposure Lab_0.1.0_x64-setup.exe`，构建报告约 209.62 MiB。
- 安装包已复制到 `E:\ExposureLab\output\windows\Exposure Lab_0.1.0_x64-setup.exe`（219,798,282 字节）。
- 2026-11-03 复测：单元测试 13/13、浏览器交互测试 4/4、浏览器离线缓存测试 1/1；`npm run build:pages` 成功。
- Rust、Cargo、Visual Studio C++ Build Tools 存于 `E:\ExposureLab-Toolchains`。
- 源码快照已提交到本地 `codex/exposure-lab` 分支，并克隆到 `E:\ExposureLab`。
- 源码已推送到 GitHub 公开仓库 `https://github.com/wen9-lab/exposure-lab` 的 `main` 分支；首次推送的提交为 `d2f1660`。

## 尚需完成

1. 复查设置页的默认曝光基准配置，以及胶片模式切换和 JSON 导入边界，修改后重测并重打 Windows 包。
2. 构建 Android APK。Android Studio 的 winget 下载因 `InternetReadFile() failed` 中断；SDK/JDK 尚未安装。优先使用 E 盘工具链目录。
3. 启用 GitHub Pages 并验证 HTTPS 页面与缓存。2026-11-03 首次检查网页为 404；仓库的 Pages 功能可能尚未启用或部署尚未完成，需查看 Actions/Pages 状态。
4. 在真实 Windows、Android、Mac、iPhone 设备上分别做离线重启验收；没有实测的项目保持待验证状态。

## 限制

当前 Windows 构建成功不等于目标设备离线安装通过。网页首次访问需联网 HTTPS 加载并缓存；清除网站数据后可能需要重新联网。Mac/iPhone 首版没有原生安装包。
