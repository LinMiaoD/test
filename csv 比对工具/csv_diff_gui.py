"""
CSV 文件差异比对工具 - 带图形界面
"""

import csv
import os
from datetime import datetime
from itertools import zip_longest
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading


def detect_encoding(filepath):
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


def read_csv(filepath):
    enc = detect_encoding(filepath)
    with open(filepath, newline="", encoding=enc) as f:
        reader = csv.DictReader(f)
        headers = list(reader.fieldnames or [])
        rows = [dict(row) for row in reader]
    return headers, rows


def normalize(val):
    """标准化单元格值：去首尾空格，数值统一格式消除 0.000 与 0 的差异"""
    v = (val or "").strip()
    if v == "":
        return ""
    try:
        f = float(v)
        return str(int(f)) if f == int(f) else str(f)
    except ValueError:
        return v


def compare_csv(file1, file2):
    lines = []

    def log(msg=""):
        lines.append(msg)

    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log(f"比对时间: {ts}")
    log(f"文件1: {file1}")
    log(f"文件2: {file2}")
    log("=" * 60)

    h1, rows1 = read_csv(file1)
    h2, rows2 = read_csv(file2)

    only1 = [c for c in h1 if c not in h2]
    only2 = [c for c in h2 if c not in h1]
    if only1:
        log(f"[列] 仅文件1存在: {only1}")
    if only2:
        log(f"[列] 仅文件2存在: {only2}")

    if len(rows1) != len(rows2):
        log(f"[行数] 文件1={len(rows1)}行  文件2={len(rows2)}行  相差{abs(len(rows1) - len(rows2))}行")

    common = [c for c in h1 if c in h2]
    diff_count = 0

    for i, (r1, r2) in enumerate(zip_longest(rows1, rows2), start=1):
        if r1 is None:
            row_str = "  ".join(f"{c}={r2.get(c, '')}" for c in common)
            log(f"[行{i}] + 文件2新增: {row_str}")
            diff_count += 1
        elif r2 is None:
            row_str = "  ".join(f"{c}={r1.get(c, '')}" for c in common)
            log(f"[行{i}] - 文件1删除: {row_str}")
            diff_count += 1
        else:
            diffs = []
            for c in common:
                v1 = normalize(r1.get(c))
                v2 = normalize(r2.get(c))
                if v1 != v2:
                    raw1 = (r1.get(c) or "").strip()
                    raw2 = (r2.get(c) or "").strip()
                    diffs.append(f'{c}: "{raw1}"->"{raw2}"')
            if diffs:
                log(f"[行{i}] ~ " + " | ".join(diffs))
                diff_count += 1

    log("=" * 60)
    log(f"共 {diff_count} 处差异" if diff_count else "无差异")

    return "\n".join(lines), diff_count


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("CSV 差异比对工具")
        self.geometry("720x620")
        self.resizable(True, True)
        self.configure(bg="#F5F6FA")
        self._result_text = ""
        self._build_ui()

    def _build_ui(self):
        tk.Label(self, text="CSV 差异比对工具", font=("Microsoft YaHei", 16, "bold"),
                 bg="#F5F6FA", fg="#2C3E50").pack(pady=(18, 4))
        tk.Label(self, text="以文件1为基准，检测文件2与文件1的差异",
                 font=("Microsoft YaHei", 9), bg="#F5F6FA", fg="#7F8C8D").pack()

        frame = tk.LabelFrame(self, text=" 选择文件 ", font=("Microsoft YaHei", 10),
                              bg="#F5F6FA", fg="#2C3E50", padx=12, pady=10)
        frame.pack(fill="x", padx=20, pady=12)

        self.file1_var = tk.StringVar()
        self.file2_var = tk.StringVar()

        for i, (label, var) in enumerate([("文件1 (基准)", self.file1_var),
                                           ("文件2 (对比)", self.file2_var)]):
            tk.Label(frame, text=label, font=("Microsoft YaHei", 9, "bold"),
                     bg="#F5F6FA", width=10, anchor="w").grid(row=i, column=0, pady=6)
            tk.Entry(frame, textvariable=var, font=("Consolas", 9),
                     width=56, relief="solid", bd=1).grid(row=i, column=1, padx=8, pady=6)
            tk.Button(frame, text="浏览…", command=lambda v=var: self._browse(v),
                      font=("Microsoft YaHei", 9), bg="#3498DB", fg="white",
                      relief="flat", padx=10, cursor="hand2").grid(row=i, column=2, padx=4)

        btn_frame = tk.Frame(self, bg="#F5F6FA")
        btn_frame.pack(pady=4)

        self.run_btn = tk.Button(btn_frame, text="▶  开始比对", command=self._run,
                                  font=("Microsoft YaHei", 11, "bold"),
                                  bg="#27AE60", fg="white", relief="flat",
                                  padx=24, pady=8, cursor="hand2")
        self.run_btn.pack(side="left", padx=8)

        tk.Button(btn_frame, text="💾  保存日志", command=self._save_log,
                  font=("Microsoft YaHei", 10), bg="#8E44AD", fg="white",
                  relief="flat", padx=16, pady=8, cursor="hand2").pack(side="left", padx=8)

        tk.Button(btn_frame, text="🗑  清空", command=self._clear,
                  font=("Microsoft YaHei", 10), bg="#95A5A6", fg="white",
                  relief="flat", padx=16, pady=8, cursor="hand2").pack(side="left", padx=8)

        out_frame = tk.LabelFrame(self, text=" 比对结果 ", font=("Microsoft YaHei", 10),
                                  bg="#F5F6FA", fg="#2C3E50", padx=8, pady=8)
        out_frame.pack(fill="both", expand=True, padx=20, pady=(4, 16))

        self.text = tk.Text(out_frame, font=("Consolas", 9), wrap="none",
                            bg="#1E1E2E", fg="#CDD6F4", insertbackground="white",
                            relief="flat", state="disabled")
        vsb = ttk.Scrollbar(out_frame, orient="vertical", command=self.text.yview)
        hsb = ttk.Scrollbar(out_frame, orient="horizontal", command=self.text.xview)
        self.text.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
        vsb.pack(side="right", fill="y")
        hsb.pack(side="bottom", fill="x")
        self.text.pack(fill="both", expand=True)

        self.text.tag_config("add",    foreground="#A6E3A1")
        self.text.tag_config("del",    foreground="#F38BA8")
        self.text.tag_config("mod",    foreground="#FAB387")
        self.text.tag_config("warn",   foreground="#F9E2AF")
        self.text.tag_config("header", foreground="#89DCEB", font=("Consolas", 9, "bold"))

        self.status_var = tk.StringVar(value="就绪")
        tk.Label(self, textvariable=self.status_var, font=("Microsoft YaHei", 9),
                 bg="#F5F6FA", fg="#7F8C8D", anchor="w").pack(fill="x", padx=20, pady=(0, 6))

    def _browse(self, var):
        path = filedialog.askopenfilename(
            title="选择 CSV 文件",
            filetypes=[("CSV 文件", "*.csv"), ("所有文件", "*.*")]
        )
        if path:
            var.set(path)

    def _clear(self):
        self.file1_var.set("")
        self.file2_var.set("")
        self._set_text("")
        self._result_text = ""
        self.status_var.set("已清空")

    def _run(self):
        f1 = self.file1_var.get().strip()
        f2 = self.file2_var.get().strip()

        if not f1 and not f2:
            messagebox.showwarning("提示", "请先选择或输入两个 CSV 文件路径！")
            return
        if not f1:
            messagebox.showwarning("提示", "文件1 路径为空，请填写！")
            return
        if not f2:
            messagebox.showwarning("提示", "文件2 路径为空，请填写！")
            return
        if not os.path.isfile(f1):
            messagebox.showerror("错误", f"文件1 不存在：\n{f1}")
            return
        if not os.path.isfile(f2):
            messagebox.showerror("错误", f"文件2 不存在：\n{f2}")
            return

        self.run_btn.config(state="disabled", text="比对中…")
        self.status_var.set("正在比对，请稍候…")
        threading.Thread(target=self._do_compare, args=(f1, f2), daemon=True).start()

    def _do_compare(self, f1, f2):
        try:
            result, diff_count = compare_csv(f1, f2)
            self._result_text = result
            self.after(0, lambda: self._show_result(result, diff_count))
        except Exception as e:
            self.after(0, lambda: messagebox.showerror("比对出错", str(e)))
            self.after(0, lambda: self.run_btn.config(state="normal", text="▶  开始比对"))

    def _show_result(self, result, diff_count):
        self._set_text(result)
        if diff_count == 0:
            self.status_var.set("✅ 比对完成，无差异")
        else:
            self.status_var.set(f"⚠️  比对完成，共发现 {diff_count} 处差异")
        self.run_btn.config(state="normal", text="▶  开始比对")

    def _set_text(self, content):
        self.text.config(state="normal")
        self.text.delete("1.0", "end")
        for line in content.splitlines():
            if line.startswith("[行") and "] +" in line:
                tag = "add"
            elif line.startswith("[行") and "] -" in line:
                tag = "del"
            elif line.startswith("[行") and "] ~" in line:
                tag = "mod"
            elif line.startswith("[列") or line.startswith("[行数"):
                tag = "warn"
            elif line.startswith("="):
                tag = "header"
            else:
                tag = None
            self.text.insert("end", line + "\n", tag if tag else "")

        self.text.config(state="disabled")
        self.text.see("1.0")

    def _save_log(self):
        if not self._result_text:
            messagebox.showinfo("提示", "还没有比对结果，请先运行比对！")
            return
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = filedialog.asksaveasfilename(
            title="保存日志",
            initialfile=f"csv_diff_{ts}.log",
            defaultextension=".log",
            filetypes=[("日志文件", "*.log"), ("文本文件", "*.txt"), ("所有文件", "*.*")]
        )
        if path:
            with open(path, "w", encoding="utf-8") as f:
                f.write(self._result_text)
            messagebox.showinfo("保存成功", f"日志已保存至：\n{path}")
            self.status_var.set(f"日志已保存: {path}")


if __name__ == "__main__":
    app = App()
    app.mainloop()
