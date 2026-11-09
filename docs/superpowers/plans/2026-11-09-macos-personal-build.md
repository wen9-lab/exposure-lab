# Mac 个人测试版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** 从 Windows 0.1.2 源码生成 Apple Silicon 的 macOS .app ZIP 与 .dmg 个人测试产物。

**Architecture:** 在独立 codex/mac-test 分支上用 GitHub Actions 的 Apple Silicon macOS runner 构建。工作流只上传 Actions artifact，不触发 main 分支的 Pages 工作流。

**Tech Stack:** React、TypeScript、Vite、Tauri 2、Rust、GitHub Actions。

**Spec:** docs/superpowers/specs/2026-11-09-macos-personal-build.md

## Global Constraints

- 仅 Apple Silicon aarch64-apple-darwin、版本 0.1.2；不宣称 Intel 已验收。
- 使用临时签名，明确没有 Apple 公证；不读取或上传 Apple 私钥。
- 不发布 Pages、不更新 Android；E 盘保留本机源码与缓存。
- .app 打包为 ZIP 后上传，保持 Unix 权限；.dmg 单独上传。

## Review Focus

- Windows 专属 NSIS targets 被 Mac CLI app,dmg 参数覆盖，并在实际 CI 中验证。
- macOS 构建机与 aarch64 目标一致，避免生成 Intel 包。
- 临时签名能通过 codesign 结构检查，但不能宣称通过 Gatekeeper 公证。
- 上传后的 ZIP 解压保留 .app 的可执行权限。
- 工作流不触发 Pages；Mac 用户真实离线与本地数据留存仍待验收。

---

### Task 1: 独立 Mac 构建工作流

**Files:**
- Create: .github/workflows/macos-test.yml
- Modify: README.md
- Modify: DELIVERY_STATUS.md

**Interfaces:**
- Consumes: 当前 0.1.2 源码、npm ci、npm test、Tauri 2。
- Produces: GitHub Actions 中的 Apple Silicon .dmg 和 .app ZIP 及哈希记录。

- [ ] Step 1: 检查现有 pages.yml 只监听 main、Tauri 当前 bundle.targets 为 nsis。
- [ ] Step 2: 写 macOS 工作流；分支限定 codex/mac-test，选择 Apple Silicon runner，安装 Node 24 与 Rust stable，运行 npm ci 和 npm test。
- [ ] Step 3: 用 APPLE_SIGNING_IDENTITY 为减号运行 Tauri app,dmg 构建，检验 codesign 与 hdiutil，使用 ditto 压缩 .app，生成 SHA-256，上传产物。
- [ ] Step 4: 在 README 写明个人测试版安装步骤与 Gatekeeper 限制，在 DELIVERY_STATUS 记录当前状态与待实机验收。

### Task 2: 构建与验收交接

**Files:**
- Verify: .github/workflows/macos-test.yml
- Verify: GitHub Actions artifact
- Update: DELIVERY_STATUS.md

**Interfaces:**
- Consumes: Task 1 工作流。
- Produces: 可下载的 Mac 安装包和可复查的验证记录。

- [ ] Step 1: 本地检查 YAML、Git diff、npm test 和 npm run build。
- [ ] Step 2: 提交并推送 codex/mac-test 分支；若认证阻止推送，记录实际阻碍并保留本地可复查的提交。
- [ ] Step 3: 检查 Actions 运行结果、下载 .dmg 与 .app ZIP，验证哈希并记录产物链接。
- [ ] Step 4: 交给用户在 M 系列 Mac 试装、断网重开、检查计算和预设；未完成前不标为实机验收通过。