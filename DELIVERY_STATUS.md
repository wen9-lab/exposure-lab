# 交付进度（2026-11-03）

## 已有产物

- 源码、中文 README、计算内核、五个页面、单元与浏览器测试已建立在本目录。
- Windows NSIS 离线安装包已构建：`E:\ExposureLab-Toolchains\target\windows\release\bundle\nsis\Exposure Lab_0.1.0_x64-setup.exe`，构建报告约 209.62 MiB。
- Rust、Cargo、Visual Studio C++ Build Tools 存于 `E:\ExposureLab-Toolchains`。
- GitHub 公开空仓库 `https://github.com/wen9-lab/exposure-lab` 已由用户建立，源码尚未推送。

## 尚需完成

1. 复跑 `npm test`、`npm run build`、`npm run build:pages`、`npm run test:e2e`、`npm run test:offline`，记录结果。
2. 复查设置页的默认曝光基准配置，以及胶片模式切换和 JSON 导入边界。
3. 构建 Android APK。Android Studio 的 winget 下载因 `InternetReadFile() failed` 中断；SDK/JDK 尚未安装。优先使用 E 盘工具链目录。
4. 发布源码至 GitHub 空仓库，启用 Pages，验证 HTTPS 页面与缓存。当地 `gh auth` 失效；GitHub 连接器有该仓库写权限，或可在提权命令中使用 Git Credential Manager。
5. 在真实 Windows、Android、Mac、iPhone 设备上分别做离线重启验收；没有实测的项目保持待验证状态。

## 限制

当前 Windows 构建成功不等于目标设备离线安装通过。网页首次访问需联网 HTTPS 加载并缓存；清除网站数据后可能需要重新联网。Mac/iPhone 首版没有原生安装包。
