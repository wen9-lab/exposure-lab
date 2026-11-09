# Mac 个人测试版设计

## 目标与范围

把已在 Windows 0.1.2 测试的 Exposure Lab 源码构建为 Apple Silicon macOS 原生应用，供用户在自己的 M 系列 Mac 上离线试用。交付 .dmg 与保留 .app 目录权限的 ZIP；不申请 Apple 开发者会员，不提交公证，不上架 App Store。本轮不更新 Android 或 GitHub Pages。

## 方案与选择

- 推荐：GitHub Actions 的 Apple Silicon macOS 构建机。在公开仓库的独立 codex/mac-test 分支上推送工作流与 0.1.2 源码，推送时自动构建；Pages 工作流只监听 main，不会在此分支发布网页。用户不需安装 Node、Rust 或 Xcode。
- 备选：用户在自己的 Mac 本地安装开发工具并构建。少依赖 GitHub Actions，但首次配置与排错工作落到用户机器上。

用户选择个人测试版；构建位置由项目采用推荐方案。只针对用户已确认的 Apple Silicon，不声称兼容 Intel。

## 构建与安全边界

Mac 目标为 aarch64-apple-darwin，Tauri 打包 app、dmg，使用临时签名身份减号。下载后 Gatekeeper 可能要求用户在“隐私与安全性”中单独允许打开；不要求关闭系统安全机制。工作流运行单元测试、校验应用签名结构和 DMG 完整性，记录 SHA-256。把 .app 先用 ditto 压缩，避免构建产物上传时丢失 Unix 权限。

GitHub Actions 产物是个人测试制品，不是已公证的正式分发包；不把缺少签名公证的警告写成已解决。用户在 Mac 上完成安装、断网重开、计算、知识页、预设留存与 JSON 备份验收。

## 用户配合

用户提供 Mac 的 macOS 版本，并在构建产物可下载后于自己的 M 系列 Mac 上测试。若首次启动被 Gatekeeper 拦截，仅针对这份来源明确的应用执行系统的“仍要打开”，把实际提示和测试结果反馈。无需 Apple 账号凭据或开发者会员。