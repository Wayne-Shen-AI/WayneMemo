# WayneMemo 数据管理指南

## 📂 数据存储位置

WayneMemo 的所有数据存储在本地：

### macOS
```
~/Documents/WayneMemo_Data/
```

### Windows
```
C:\Users\<用户名>\Documents\WayneMemo_Data\
```

---

## 📁 数据目录结构

```
WayneMemo_Data/
├── metadata.json              # 笔记索引和配置
├── notes/                     # 笔记内容目录
│   ├── note-1.md
│   ├── note-2.md
│   └── ...
├── operation_logs.json        # 操作历史记录
└── snippets.json              # 快捷码配置
```

---

## 🔄 数据初始化说明

### 新用户首次安装

**其他用户首次安装 WayneMemo 时，会自动初始化：**

1. **应用启动时检测**
   - 检查 `~/Documents/WayneMemo_Data/` 是否存在
   - 如果不存在，自动创建目录

2. **自动创建初始文件**
   - `metadata.json` - 空的笔记列表
   - `notes/` - 空的笔记目录
   - `operation_logs.json` - 空的操作日志
   - `snippets.json` - 默认快捷码（如果有）

3. **首次启动界面**
   - 显示空白编辑器
   - 没有任何历史笔记
   - 可以立即开始创建第一篇笔记

**✅ 所以其他用户安装后是完全干净的初始化版本！**

---

## 🧹 清除测试数据（恢复初始状态）

### 方法一：删除整个数据目录（完全重置）

#### macOS
```bash
# 完全删除数据目录
rm -rf ~/Documents/WayneMemo_Data/

# 重新启动 WayneMemo，会自动创建新的空数据目录
```

#### Windows
```cmd
# 在文件资源管理器中删除
C:\Users\<用户名>\Documents\WayneMemo_Data\

# 或使用命令行
rmdir /s /q "%USERPROFILE%\Documents\WayneMemo_Data"
```

**重启应用后，会像新用户一样初始化。**

---

### 方法二：只清除笔记，保留配置

如果您想保留快捷码和技能配置，只删除笔记：

#### macOS
```bash
# 删除所有笔记
rm -rf ~/Documents/WayneMemo_Data/notes/*

# 清空 metadata.json
echo '{
  "version": 1,
  "lastId": 0,
  "notes": [],
  "userRole": null,
  "enabledSkills": ["quickSearch", "history"]
}' > ~/Documents/WayneMemo_Data/metadata.json

# 清空操作日志
echo '[]' > ~/Documents/WayneMemo_Data/operation_logs.json
```

#### Windows
```cmd
# 删除所有笔记
del /q "%USERPROFILE%\Documents\WayneMemo_Data\notes\*"

# 手动编辑 metadata.json 和 operation_logs.json
```

---

### 方法三：备份后清除

如果您想保留测试数据作为备份：

#### macOS
```bash
# 1. 备份现有数据
mv ~/Documents/WayneMemo_Data ~/Documents/WayneMemo_Data_backup_$(date +%Y%m%d)

# 2. 重启 WayneMemo，自动创建新的空数据目录

# 3. 如需恢复备份
# rm -rf ~/Documents/WayneMemo_Data
# mv ~/Documents/WayneMemo_Data_backup_20260225 ~/Documents/WayneMemo_Data
```

#### Windows
```cmd
# 1. 在文件资源管理器中重命名文件夹
WayneMemo_Data → WayneMemo_Data_backup

# 2. 重启 WayneMemo，自动创建新的空数据目录
```

---

## 🔍 验证数据状态

### 检查是否为初始状态

#### macOS
```bash
# 查看笔记数量
ls ~/Documents/WayneMemo_Data/notes/ | wc -l

# 应该显示 0（没有笔记）

# 查看 metadata.json
cat ~/Documents/WayneMemo_Data/metadata.json

# 应该显示空的笔记列表：
# {
#   "version": 1,
#   "lastId": 0,
#   "notes": [],
#   ...
# }
```

#### Windows
```cmd
# 查看笔记数量
dir "%USERPROFILE%\Documents\WayneMemo_Data\notes"

# 应该显示 "找不到文件" 或空目录
```

---

## 📊 您的当前状态

### 当前数据内容

根据检查，您的数据目录包含：

```
~/Documents/WayneMemo_Data/
├── metadata.json          # 有 1 篇笔记 (id: 3)
├── notes/
│   └── note-3.md         # 测试笔记
├── operation_logs.json    # 15 KB 操作历史
└── snippets.json          # 2 KB 快捷码配置
```

**这是测试时产生的数据，不是初始状态。**

---

## ✅ 推荐操作

### 对于您（开发者）

**清除测试数据，验证初始化流程：**

```bash
# 1. 完全删除数据目录
rm -rf ~/Documents/WayneMemo_Data/

# 2. 重新打开 WayneMemo
open /Applications/WayneMemo.app

# 3. 验证：
# - 应该看到空白编辑器
# - 没有任何历史笔记
# - 可以创建第一篇笔记
```

### 对于其他用户

**完全不用担心！**

- ✅ 其他用户首次安装时，`WayneMemo_Data` 目录不存在
- ✅ 应用会自动创建空的数据目录
- ✅ 是完全干净的初始化状态
- ✅ 不会有您的测试数据

---

## 🔐 数据隔离说明

### 每个用户的数据是独立的

- **macOS**: 数据在 `~/Documents/`（每个用户的主目录）
- **Windows**: 数据在 `C:\Users\<用户名>\Documents\`

**不同用户登录同一台电脑，数据是完全隔离的。**

### 卸载应用后数据保留

- ✅ 卸载 WayneMemo 应用
- ✅ 数据目录 `WayneMemo_Data` 仍然保留
- ✅ 重新安装后数据会自动恢复

**如需完全清除，需要手动删除数据目录。**

---

## 📝 数据迁移

### 导出数据

所有笔记都是 Markdown 文件，可以直接复制：

```bash
# 备份整个数据目录
cp -r ~/Documents/WayneMemo_Data ~/Desktop/WayneMemo_Backup

# 或只备份笔记
cp -r ~/Documents/WayneMemo_Data/notes ~/Desktop/WayneMemo_Notes_Backup
```

### 导入数据

```bash
# 恢复整个数据目录
cp -r ~/Desktop/WayneMemo_Backup ~/Documents/WayneMemo_Data

# 或只导入笔记
cp ~/Desktop/WayneMemo_Notes_Backup/*.md ~/Documents/WayneMemo_Data/notes/
```

---

## ❓ 常见问题

### Q1: 我的测试数据会影响其他用户吗？
**A**: 不会！每个用户的数据存储在各自的用户目录中，完全隔离。

### Q2: 其他用户首次安装是什么状态？
**A**: 完全干净的初始状态，空白编辑器，没有任何笔记。

### Q3: 如何恢复到初始状态？
**A**: 删除 `~/Documents/WayneMemo_Data/` 目录，重启应用即可。

### Q4: 卸载应用会删除数据吗？
**A**: 不会！数据会保留。需要手动删除数据目录。

### Q5: 如何备份我的笔记？
**A**: 直接复制 `WayneMemo_Data` 目录到其他位置（如云盘）。

### Q6: 数据格式是什么？
**A**: 笔记是纯文本 Markdown 格式，可用任何文本编辑器打开。

---

## 🎯 快速清除命令

### macOS 一键清除（恢复初始状态）

```bash
# 删除数据目录
rm -rf ~/Documents/WayneMemo_Data/

# 重启应用
open /Applications/WayneMemo.app
```

### Windows 一键清除

```cmd
# 删除数据目录
rmdir /s /q "%USERPROFILE%\Documents\WayneMemo_Data"

# 重启应用（从开始菜单）
```

---

## ✅ 总结

| 问题 | 回答 |
|------|------|
| 您的数据是测试缓存吗？ | ✅ 是的，包含测试笔记和配置 |
| 其他用户是初始化版本吗？ | ✅ 是的，完全干净的初始状态 |
| 如何清除测试数据？ | 删除 `WayneMemo_Data` 目录即可 |
| 数据会互相影响吗？ | ❌ 不会，每个用户数据独立 |
| 卸载应用会删除数据吗？ | ❌ 不会，数据会保留 |

**您的测试数据不会影响其他用户，他们安装后会自动初始化空的数据目录！** 🎉

---

**版本**: v1.0.0
**更新日期**: 2026-02-25
