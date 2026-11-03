# 交付状态（2026-11-03）

## 已生成与验证

- 源码位于 `E:\ExposureLab`，公开仓库为 <https://github.com/wen9-lab/exposure-lab>。五个页面、计算内核、阳光 16、胶片 EI、预设、历史和 JSON 备份均已实现。
- Windows x64 NSIS 安装包：`E:\ExposureLab\output\windows\Exposure Lab_0.1.0_x64-setup.exe`，219,798,875 字节，SHA-256 `0532416E76639A31FF2D3576F19261BFC5110273979BFF83A9D62A51E14AF0C0`。构建配置包含离线 WebView2 安装程序。
- 已在本机将 Windows 应用安装到 `E:\ExposureLab-App`：安装程序退出码为 0，程序启动后窗口标题为“摄影曝光实验室”。这项烟雾测试不覆盖断网和缺少 WebView2 的情形。
- Android ARM64 调试签名 APK：`E:\ExposureLab\output\android\app-universal-debug.apk`，137,174,172 字节，SHA-256 `D8BA1449E92F3F7727D1AE323F92AE7CAB9F01C4AF4138C26F187FEF6EA95F03`。`apksigner verify` 通过 v2 签名；包名 `io.github.wen9lab.exposurelab.debug`，最低 API 24，目标 API 35，仅含 `arm64-v8a` 原生库。
- Mac/iPhone 可用的 HTTPS 网页：<https://wen9-lab.github.io/exposure-lab/>。GitHub Pages 部署成功；Windows Edge 上的线上首次缓存、断网刷新与本地状态保留测试通过。
- 最近一次测试：计算单元测试 15/15、浏览器交互 5/5、本地和线上网页离线测试各 1/1；Windows 和 Android 前端构建成功。
- Android SDK、JDK、Gradle、Rust、NDK 与构建缓存位于 `E:\ExposureLab-Toolchains`。用户已同意 Android SDK 许可，所需许可已接受。Android 模块使用 `compileSdk 36`、`targetSdk 35`。
- 本任务产生的 C 盘 `node_modules`、旧安装包、临时截图、Android SDK 缓存已清除；误装在 C 盘的 Microsoft OpenJDK 17 已通过正式卸载程序移除，ADB 密钥已校验后迁到 E 盘。C 盘重复源码副本已删除，后续编辑以 E 盘主工程为准。

## 尚待真实设备验收

1. Windows：在缺少 WebView2 的实际设备上断网安装，关闭并重启后检查计算、知识页和预设。
2. Android：当前 ADB 未发现连接设备；真机安装、断网重启与预设保留待验证。
3. Mac/iPhone：在各自浏览器首次 HTTPS 缓存后，断网重开与本地数据保留待验证。

网页首次加载需要网络和 HTTPS；浏览器清除网站数据后可能需重新联网。Android APK 是个人测试用调试签名包，长期分发与后续升级需要专用签名密钥。未完成的真实设备测试不计入已通过验收。
