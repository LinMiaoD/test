import os

# 要删除的 Cargo.toml 文件路径
files_to_delete = [
    r"C:\Users\Administrator\Desktop\学习资料\learning-notes-programming\rust学习\2_所有权与借用\2_1_所有权规则\Cargo.toml",
    r"C:\Users\Administrator\Desktop\学习资料\learning-notes-programming\rust学习\2_所有权与借用\2_2_引用与借用\Cargo.toml",
    r"C:\Users\Administrator\Desktop\学习资料\learning-notes-programming\rust学习\2_所有权与借用\2_3_生命周期\Cargo.toml",
]

for file_path in files_to_delete:
    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"已删除: {file_path}")
    else:
        print(f"文件不存在: {file_path}")

print("\n删除完成！")
