# Exposure Knowledge Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Replace eight shallow cards with an offline, eight-chapter exposure course for beginners with optional advanced detail.

**Architecture:** Keep the existing page switcher and calculation engine. Extract the knowledge page to src/Knowledge.tsx with local structured chapter content, local tables and CSS illustrations. Add focused browser coverage for navigation, key facts, mobile layout and offline content.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Playwright, Tauri 2, local CSS.

**Spec:** docs/superpowers/specs/2026-11-09-knowledge-library-design.md

## Global Constraints

- All essential knowledge text and illustrations must be bundled and fully usable offline.
- No change to calculator logic, data format, or reference ladders.
- Eight chapters cover the design topics; six scene cases must show goal, starting point, reason, check and fallback.
- Distinguish physical exposure, ISO-based output trend, conventional EV, and app-relative ΔEV.
- Treat Sunny 16 and weather values as empirical starting points.
- Publish updated Pages and rebuild Windows offline installer and ARM64 debug APK; pending physical-device tests remain pending.

## Review Focus

- Index link navigation: selecting a chapter must scroll to the correct heading without losing page content.
- Narrow mobile viewport: tables must scroll inside their own container and page width must not overflow.
- Nominal aperture rounding: f/4 to f/2.8 plus 1/500 to 1/1000 must state approximately +0.029 EV rather than exact numeric zero.
- Sunny 16 ISO 400: exact 1/400 and full-stop 1/500 must state approximately −0.32 EV.
- Film EI 800 on ISO 400: explanation must show one stop less exposure and not claim sensitivity changes.

---

### Task 1: Course content and chapter navigation

**Files:**
- Create: src/Knowledge.tsx
- Modify: src/App.tsx (replace inline Knowledge definition with import)
- Test: e2e/knowledge.spec.ts

**Interfaces:**
- Produces: default Knowledge(): JSX.Element, imported by App.tsx.
- Consumes: no calculator state; static local content only.

- [x] Step 1: Write failing Playwright test for eight chapter headings, chapter anchor navigation, key numeric and EI statements, and six scene cases.
- [x] Step 2: Run npm run test:e2e -- e2e/knowledge.spec.ts; expect missing chapter/anchor assertions.
- [x] Step 3: Implement Knowledge() and its local content with eight chapters, simple tables, six structured scenes, native details for advanced notes and section IDs.
- [x] Step 4: Run targeted Playwright test; expect pass.
- [x] Step 5: Commit source, test and design/plan docs.

### Task 2: Readable responsive styling and offline coverage

**Files:**
- Modify: src/style.css
- Modify: e2e/knowledge.spec.ts
- Modify: e2e-offline/offline.spec.ts

**Interfaces:**
- Consumes: section IDs and class names from Task 1.
- Produces: single-column reading layout and table overflow containment.

- [x] Step 1: Add failing mobile assertion for document scrollWidth <= viewport and a local-offline assertion that chapter text remains visible.
- [x] Step 2: Run targeted Playwright tests; expect mobile width or content assertion failure.
- [x] Step 3: Add layout, type, table, illustration and touch styles; refine offline page test without network dependency.
- [x] Step 4: Run npm test, npm run test:e2e, npm run test:offline and npm run build:pages; expect all pass.
- [x] Step 5: Commit styles and tests.

### Task 3: Publish and package revised content

**Files:**
- Modify: README.md, DELIVERY_STATUS.md
- Output: output/windows installer and output/android APK

**Interfaces:**
- Consumes: built and verified course from Tasks 1-2.
- Produces: GitHub Pages deployment, refreshed signed test installers, hashes and accurate delivery record.

- [x] Step 1: Update README and delivery notes with knowledge edition and source reference notes.
- [x] Step 2: Commit, push public source and confirm GitHub Pages workflow/URL serves new chapter text.
- [x] Step 3: Run scripts/build-windows.ps1 and scripts/build-android.ps1 using E toolchains; verify file metadata and hashes.
- [x] Step 4: Run available local smoke checks and update DELIVERY_STATUS.md; leave unavailable physical-device tests marked pending.
- [x] Step 5: Commit/push final delivery record and verify clean state.
