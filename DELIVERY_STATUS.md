# 交付状态（2026-11-09，知识库 0.1.1）

## 已生成与验证

- 源码位于 E:\ExposureLab，公开仓库为 https://github.com/wen9-lab/exposure-lab。五个页面、计算内核、阳光 16、胶片 EI、预设、历史和 JSON 备份均已实现。
- 曝光知识库已改为八章循序课程，包含档位数学、测光与补偿、数码/胶片差异、六类场景案例、表格和可展开进阶说明；所有正文随应用打包，离线可读。
- 公开 HTTPS 网页为 https://wen9-lab.github.io/exposure-lab/；2026-11-09 已确认网页引用新版脚本 index-CiUnsXwG.js。Windows Edge 上新版线上首次缓存、断网重开、知识库可读与本地状态保留测试通过。
- Windows x64 NSIS 0.1.1 离线安装包：E:\ExposureLab\output\windows\Exposure Lab_0.1.1_x64-setup.exe，219,715,324 字节，SHA-256 90EAD92971CCD75255817699F17806997091C149B705E4D3AE833A5A5FEAD67B。构建配置包含离线 WebView2 安装程序。
- 已在本机把 Windows 0.1.1 安装到 E:\ExposureLab-App：安装程序退出码 0；应用启动后窗口标题为“摄影曝光实验室”，产品版本为 0.1.1。这项本机烟雾测试不覆盖缺少 WebView2 的断网环境。
- Android ARM64 调试签名 0.1.1 APK：E:\ExposureLab\output\android\ExposureLab_0.1.1_arm64-debug.apk，137,215,684 字节，SHA-256 A5FC16C69C3E201DDEC48B16B4796A3862479037CA1850F437C09F3B11B85D74。apksigner 验证通过 v2 签名；包名 io.github.wen9lab.exposurelab.debug，versionName 0.1.1，min API 24、target API 35、compile API 36，仅含 arm64-v8a 原生库。APK 中原生库哈希与本次 Rust 编译产物一致。
- 当前账户没有创建 Windows 符号链接的权限；Android 构建脚本已在 Tauri 编译成功后自动切换到 Gradle 打包，并实测成功，无需更改系统设置。Android SDK、JDK、Gradle、Rust、NDK 和构建缓存均位于 E:\ExposureLab-Toolchains。
- 最新自动测试：计算单元测试 15/15、浏览器交互 8/8、本地和线上网页离线测试各 1/1。桌面及 390 px 手机知识库截图已检查；手机页面无横向溢出，宽表格可在自身区域横向滚动。
- 本任务产生的 C 盘 node_modules、旧安装包、临时截图和 Android SDK 缓存已清除；误装在 C 盘的 Microsoft OpenJDK 17 已通过正式卸载程序移除，ADB 密钥已校验后迁到 E 盘。C 盘重复源码副本已删除，后续编辑以 E 盘主工程为准。

## 尚待真实设备验收

1. Windows：在缺少 WebView2 的实际设备上断网安装，关闭并重启后检查计算、知识页和预设。
2. Android：用户暂时不方便连接手机；真机安装、断网重启与预设保留待验证。
3. Mac/iPhone：在各自浏览器首次 HTTPS 缓存后，断网重开与本地数据保留待验证。

网页首次加载需要网络和 HTTPS；浏览器清除网站数据后可能需重新联网。Android APK 是个人测试用调试签名包，长期分发与后续升级需要专用签名密钥。未完成的真实设备测试不计入已通过验收。旧版 Windows 0.1.0 安装包仍留在 output/windows，不能视为包含新版知识库。
