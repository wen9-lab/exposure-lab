#!/usr/bin/env python3
"""
为 Tauri Android 工程注入正式签名配置（幂等，可重复运行）。

用法:
  python3 scripts/prepare-android-release.py \
      --keystore /absolute/path/to/release.jks \
      --store-pass PASS --key-alias ALIAS --key-pass PASS

说明:
  src-tauri/gen/ 被 .gitignore 排除，故每次全新 clone 后需先运行
  `npm run tauri -- android init`，再运行本脚本注入签名配置。
  密钥材料通过参数传入，不写入任何会提交到仓库的文件。

  注意: tauri.properties 由 Tauri 在构建时自动生成，versionCode 从
  Cargo.toml 的版本号推导（0.1.2 -> 1002），不要手动改写该文件。
"""
import argparse
import sys
from pathlib import Path

BLOCK_BEGIN = "// >>> EXPOSURE LAB RELEASE SIGNING (managed by prepare-android-release.py) >>>"
BLOCK_END = "// <<< EXPOSURE LAB RELEASE SIGNING <<<"


def edit_gradle(gradle_path: Path, keystore: str, store_pass: str,
                key_alias: str, key_pass: str) -> None:
    text = gradle_path.read_text(encoding="utf-8")

    # 1) 修正 SDK 版本：Tauri 模板默认 37，本工程固定 compileSdk 36 / targetSdk 35
    text = _reassign(text, "compileSdk", "36")
    text = _reassign(text, "targetSdk", "35")

    # 2) 幂等移除旧的注入块
    text = _strip_managed_block(text)

    # 3) 注入 signingConfigs 块（放在 android { 之后）
    inject = (
        f"{BLOCK_BEGIN}\n"
        "    signingConfigs {\n"
        '        create("release") {\n'
        f'            storeFile = file("{keystore}")\n'
        f'            storePassword = "{store_pass}"\n'
        f'            keyAlias = "{key_alias}"\n'
        f'            keyPassword = "{key_pass}"\n'
        "        }\n"
        "    }\n"
        f"{BLOCK_END}\n"
    )
    marker = "android {\n"
    if marker not in text:
        sys.exit("ERROR: 'android {' block not found in build.gradle.kts")
    text = text.replace(marker, marker + inject, 1)

    # 4) 在 release buildType 内挂上 signingConfig
    release_marker = '        getByName("release") {\n'
    if release_marker not in text:
        sys.exit("ERROR: release buildType not found in build.gradle.kts")
    text = text.replace(
        release_marker,
        release_marker + '            signingConfig = signingConfigs.getByName("release")\n',
        1,
    )

    gradle_path.write_text(text, encoding="utf-8")
    print(f"[ok] injected signing config into {gradle_path}")


def _reassign(text: str, key: str, value: str) -> str:
    import re
    pattern = rf"(\b{key}\s*=\s*)\d+"
    new_text, n = re.subn(pattern, rf"\g<1>{value}", text, count=1)
    if n == 0:
        sys.exit(f"ERROR: '{key} = <number>' not found")
    return new_text


def _strip_managed_block(text: str) -> str:
    while BLOCK_BEGIN in text and BLOCK_END in text:
        start = text.index(BLOCK_BEGIN)
        end = text.index(BLOCK_END) + len(BLOCK_END)
        # 连同行尾换行一并移除
        if end < len(text) and text[end] == "\n":
            end += 1
        text = text[:start] + text[end:]
    # 清理之前注入到 release 块内的 signingConfig 行（幂等）
    line = '            signingConfig = signingConfigs.getByName("release")\n'
    text = text.replace(line, "")
    return text


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--keystore", required=True)
    ap.add_argument("--store-pass", required=True)
    ap.add_argument("--key-alias", required=True)
    ap.add_argument("--key-pass", required=True)
    ap.add_argument("--project-root", default=".", help="仓库根目录")
    args = ap.parse_args()

    root = Path(args.project_root).resolve()
    gradle = root / "src-tauri/gen/android/app/build.gradle.kts"
    keystore = Path(args.keystore).resolve()

    if not gradle.exists():
        sys.exit(f"ERROR: {gradle} not found. Run `npm run tauri -- android init` first.")
    if not keystore.exists():
        sys.exit(f"ERROR: keystore not found: {keystore}")

    edit_gradle(gradle, str(keystore), args.store_pass, args.key_alias, args.key_pass)
    print("[done] Android release signing prepared.")


if __name__ == "__main__":
    main()
