# 摄影曝光实验室 / Exposure Lab

完全离线的摄影曝光教学与计算工具。首版包含 Windows、Android 安装配置，以及供 Mac 和 iPhone 使用的可离线缓存网页。两个计算器共用纯 TypeScript 计算内核，设置、预设和历史留在当前设备。

## Windows 0.1.2 补偿目标修正

两款计算器的曝光目标都以 1/3 EV 步进，可显示 0、±0.3、±0.7、±1 等相机常见读数；显示值是近似数，内部使用精确的 1/3 和 2/3 EV。可用按钮、滑块或键盘调整，目标分别保存在两款计算器的本地状态中。

曝光目标只是希望达到的偏移，单独调整目标不会改变实际进光量或 ISO 推算的亮度。完整档计算器的光圈、快门与 ISO 仍只按整档调整，无法精确达到 1/3 EV 目标时会显示剩余偏差；速查表也显示完整的 1/3 EV 补偿刻度。

此修正当前仅制作和本机启动验证了 Windows 0.1.2 安装包。公开网页与 Android APK 仍为 0.1.1；Mac/iPhone 与 Android 的更新在 Windows 版确认后进行。

## 功能

- 独立的完整 1 档与精细 1/3 档计算器，各自保存基准和操作状态。
- 按标准档位索引判断交换；同时显示按标称数值计算的实际偏差。
- 区分理论进光量变化与按 ISO 推算的亮度变化。
- 自动补偿、参数锁定、设备范围、数码与胶片模式、胶卷 ISO 与测光 EI。
- 阳光 16 的理论精确和标准档位两种基准方式。
- 离线知识库、档位速查表、预设、历史与 JSON 备份。

## 开发和测试

需要 Node.js 24、npm，以及 Windows 安装包所需的 Rust MSVC 工具链和 Microsoft C++ Build Tools。Android 构建还需要 Android SDK、JDK 和 Rust Android 目标。各平台的具体先决条件以 [Tauri 官方说明](https://v2.tauri.app/start/prerequisites/) 为准。

```powershell
npm ci --cache E:\ExposureLab-Toolchains\npm-cache
npm test
npm run dev
npm run build
npm run build:pages
npm run test:e2e
npm run test:offline
npm run test:live
```

`npm run build:pages` 生成 GitHub Pages 路径 `/exposure-lab/` 下的静态网页。网页首次打开需要 HTTPS；服务工作线程缓存完成后可断网使用。清除浏览器网站数据会删除缓存和本地预设，请先导出 JSON。
`npm run test:offline` 会先重新构建 Pages 版本，再测试首次缓存后的断网重开。
`npm run test:live` 对已发布的 HTTPS 网页执行相同的断网重开测试，需要联网完成首次加载。

## Windows 安装

```powershell
.\scripts\build-windows.ps1
```

Tauri 配置使用 NSIS 和 `offlineInstaller` WebView2 模式。脚本将安装包复制到 `output/windows/`；**只有执行上述命令并验证产物后才算已交付安装包**。此方式使没有 WebView2 的 Windows 设备也能离线安装，但安装包体积会增加。

## Mac 个人测试版（Apple Silicon）

codex/mac-test 分支的 GitHub Actions 工作流生成 Apple Silicon 的 .dmg 和 .app ZIP。应用使用临时签名，没有 Apple 开发者证书或公证，供个人测试，不作为已公证的正式分发包。Windows 0.1.2 的功能代码随此分支构建；公开网页和 Android APK 不随此工作流更新。

从该分支的 Actions 运行记录下载产物，优先打开 .dmg，将 Exposure Lab.app 拖入“应用程序”。首次启动若被 macOS 拦截，在确认下载来源后到“系统设置 > 隐私与安全性”选择“仍要打开”；不要关闭整个系统的应用安全检查。Apple 的操作说明：https://support.apple.com/en-us/102445

安装后断网，完全退出并重新打开应用，检查两个计算器的 1/3 EV 曝光目标、知识库和预设留存，再测试 JSON 导出与导入。此项必须在用户自己的 M 系列 Mac 上通过，CI 构建成功不等于实机验收通过。

## Android 安装

在已安装 Android SDK、JDK 与 Android Rust 目标的环境中：

```powershell
.\scripts\build-android.ps1
```

脚本初始化 Android 工程并构建带调试签名的 ARM64 APK，复制到 `output/android/`。它适合个人测试；正式长期分发或升级应配置并保管专用签名密钥。Android 真机首次安装可能需在系统设置中允许从该来源安装应用。
脚本默认从 E 盘读取 Android SDK，并把 Gradle、Rust 构建产物及 Android 用户目录放在 E 盘；应用使用 `compileSdk 36`、`targetSdk 35`、`minSdk 24`。若 Windows 账户没有创建符号链接的权限，构建脚本会在 Tauri 编译原生库后自动改用 Gradle 打包，无需改变系统设置。调试版包名带 `.debug` 后缀；版本化 APK 放在 output/android，便于与旧版区分。

## 计算口径与限制

`ΔEV = log₂[(t × ISO / N²) / (t₀ × ISO₀ / N₀²)]`，`ΔLight = log₂[(t / N²) / (t₀ / N₀²)]`。前者只是理论亮度趋势，后者是理论像面曝光比例；两者都不预测照片最终像素亮度。镜头透光率、ND、场景变化和相机处理没有包含在模型内。

标准档位使用独立索引，显示值的取整偏差另外展示。例如 f/4、1/500 秒、ISO 100 改为 f/2.8、1/1000 秒、ISO 100，属于档位等效，但按显示数值计算约为 `+0.029 EV`。阳光 16 是经验起点，不替代测光。

## 离线验收清单

1. 安装或首次缓存后，断开 Wi-Fi 和移动网络，彻底关闭再启动。
2. 打开五个页面，调整光圈、快门与 ISO，验证 A–F 示例结果。
3. 保存预设、重启并确认仍在；导出 JSON 后重新导入。
4. Windows 在缺少 WebView2 的目标环境测试离线安装；Android 在真机测试安装和断网重启。
5. Mac/iPhone 网页需先通过 HTTPS 加载，待缓存完成后再进入飞行模式复测。浏览器清除数据后需重新联网加载。

本仓库的公开访问只提供程序代码与静态网页，不上传用户的预设、历史或设置。

## 知识库课程（0.1.1）

知识库现为八章离线课程：曝光模型；光圈、快门、ISO；档位数学；EV、测光与补偿；曝光等效；阳光 16；数码与胶片；六类场景实战。每章包含解释、算例和使用边界；进阶说明可展开，手机端表格在表格区域内横向滚动。

教学数值基于本软件的简化模型和原需求书。阳光 16 与天气扩展均为经验起点；传统 EV 与本软件的相对亮度 ΔEV、物理进光量与按 ISO 推算的亮度趋势分别解释。进一步阅读可参考 [尼康的曝光基础教程](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/a-basic-look-at-the-basics-of-exposure)、[尼康的雪景拍摄建议](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/tips-for-shooting-in-cold-weather)及 [柯达的胶片参考指南](https://www.kodak.com/content/products-brochures/Film/kodak-essential-reference-guide-for-filmmakers.pdf)。这些在线资料仅用于内容校核，应用离线阅读不依赖它们。
