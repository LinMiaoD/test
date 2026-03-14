"""
CSV 文件差异比对工具
使用方法：直接修改下方 FILE1 和 FILE2 路径，双击 exe 运行，自动生成日志文件。
"""

import csv
import os
import sys
import logging
from datetime import datetime
from itertools import zip_longest

# ============================================================
#  ★★★ 在这里填写两个 CSV 文件的路径 ★★★
# ============================================================
FILE1 = r"C:\path\to\file1.csv"
FILE2 = r"C:\path\to\file2.csv"
# ============================================================

# 日志输出目录（默认与 exe 同目录）
OUTPUT_DIR = os.path.dirname(os.path.abspath(sys.argv[0]))


def setup_logger(log_path: str) -> logging.Logger:
    logger = logging.getLogger("csv_diff")
    logger.setLevel(logging.DEBUG)
    fmt = logging.Formatter("%(message)s")

    fh = logging.FileHandler(log_path, encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    return logger


def detect_encoding(filepath: str) -> str:
    """简单探测文件编码（BOM-UTF8 / UTF-8 / GBK）"""
    with open(filepath, "rb") as f:
        raw = f.read(4)
    if raw[:3] == b"\xef\xbb\xbf":
        return "utf-8-sig"
    try:
        with open(filepath, encoding="utf-8") as f:
            f.read()
        return "utf-8"
    except UnicodeDecodeError:
        return "gbk"


def read_csv(filepath: str):
    """读取 CSV，返回 (headers: list, rows: list[dict])"""
    enc = detect_encoding(filepath)
    with open(filepath, newline="", encoding=enc) as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        rows = [dict(row) for row in reader]
    return list(headers), rows


def compare_headers(h1, h2, log):
    only1 = [c for c in h1 if c not in h2]
    only2 = [c for c in h2 if c not in h1]
    common = [c for c in h1 if c in h2]

    if not only1 and not only2:
        log.info("  ✅ 列名完全一致，共 %d 列", len(h1))
    else:
        if only1:
            log.info("  ➖ 仅文件1存在的列 (%d 个): %s", len(only1), only1)
        if only2:
            log.info("  ➕ 仅文件2存在的列 (%d 个): %s", len(only2), only2)

    # 顺序检查（公共列）
    order1 = [c for c in h1 if c in common]
    order2 = [c for c in h2 if c in common]
    if order1 != order2:
        log.info("  ⚠️  公共列在两文件中的顺序不同")
        log.info("      文件1顺序: %s", order1)
        log.info("      文件2顺序: %s", order2)

    return common


def compare_rows(rows1, rows2, common_cols, log):
    diff_count = 0
    max_len = max(len(rows1), len(rows2))

    for i, (r1, r2) in enumerate(zip_longest(rows1, rows2), start=1):
        if r1 is None:
            log.info("  ➕ 数据行 %-5d [仅文件2存在] %s",
                     i, {c: r2.get(c, "") for c in common_cols})
            diff_count += 1
        elif r2 is None:
            log.info("  ➖ 数据行 %-5d [仅文件1存在] %s",
                     i, {c: r1.get(c, "") for c in common_cols})
            diff_count += 1
        else:
            cell_diffs = []
            for col in common_cols:
                v1 = (r1.get(col) or "").strip()
                v2 = (r2.get(col) or "").strip()
                if v1 != v2:
                    cell_diffs.append(f'列[{col}]: "{v1}" → "{v2}"')
            if cell_diffs:
                log.info("  ✏️  数据行 %-5d %s", i, " | ".join(cell_diffs))
                diff_count += 1

    return diff_count


def main():
    # 生成带时间戳的日志文件名
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = os.path.join(OUTPUT_DIR, f"csv_diff_{ts}.log")
    log = setup_logger(log_path)

    banner = "=" * 60
    log.info(banner)
    log.info("  CSV 文件差异比对报告")
    log.info("  生成时间: %s", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    log.info(banner)
    log.info("  基准文件 (文件1): %s", FILE1)
    log.info("  对比文件 (文件2): %s", FILE2)
    log.info(banner)

    # ── 文件检查 ──────────────────────────────────────────
    for label, path in [("文件1", FILE1), ("文件2", FILE2)]:
        if not os.path.isfile(path):
            log.error("\n❌ %s 不存在: %s", label, path)
            log.info("\n日志已保存至: %s", log_path)
            input("\n按 Enter 键退出...")
            sys.exit(1)

    # ── 读取数据 ──────────────────────────────────────────
    h1, rows1 = read_csv(FILE1)
    h2, rows2 = read_csv(FILE2)
    log.info("\n  文件1: %d 列  |  %d 数据行", len(h1), len(rows1))
    log.info("  文件2: %d 列  |  %d 数据行", len(h2), len(rows2))

    # ── 1. 列差异 ─────────────────────────────────────────
    log.info("\n%s", "-" * 60)
    log.info("【1】列（表头）差异")
    log.info("-" * 60)
    common_cols = compare_headers(h1, h2, log)

    # ── 2. 行数差异 ───────────────────────────────────────
    log.info("\n%s", "-" * 60)
    log.info("【2】行数差异")
    log.info("-" * 60)
    if len(rows1) == len(rows2):
        log.info("  ✅ 行数相同，均为 %d 行", len(rows1))
    else:
        log.info("  ⚠️  文件1: %d 行  |  文件2: %d 行  |  相差 %d 行",
                 len(rows1), len(rows2), abs(len(rows1) - len(rows2)))

    # ── 3. 逐行内容差异 ───────────────────────────────────
    log.info("\n%s", "-" * 60)
    log.info("【3】逐行内容差异（公共列对比）")
    log.info("-" * 60)
    if not common_cols:
        log.info("  ⚠️  无公共列，跳过内容对比")
        diff_count = 0
    else:
        diff_count = compare_rows(rows1, rows2, common_cols, log)
        if diff_count == 0:
            log.info("  ✅ 所有行内容完全一致，无差异！")

    # ── 汇总 ──────────────────────────────────────────────
    log.info("\n%s", "=" * 60)
    log.info("  比对完成，共发现 %d 处差异", diff_count)
    log.info("  日志已保存至: %s", log_path)
    log.info("=" * 60)

    input("\n按 Enter 键退出...")


if __name__ == "__main__":
    main()
