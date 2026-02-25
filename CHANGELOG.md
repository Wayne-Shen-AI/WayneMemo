# WayneMemo 更新日志

## v1.0.0 - 2026-02-25

### 🎉 新特性
- ✨ **完全离线化** - 移除 GitHub Gist 依赖，数据完全存储在本地
- 💾 **本地文件存储** - 笔记以 Markdown 格式保存在 `~/Documents/WayneMemo_Data/`
- 🌍 **跨平台支持** - 支持 Windows、macOS Intel 和 Apple Silicon
- 🇨🇳 **中文本地化** - 完整的中文界面
- 🎨 **品牌重塑** - 更名为 WayneMemo，全新 Logo
- 📝 **便签模式** - 窗口调整到 400x600 自动进入便签模式，300ms 平滑动画
- ⌨️ **全局快捷键** - Cmd/Ctrl + . 快速唤出应用
- 🔔 **每日碎片笔记提醒** - 每天 20:00 自动检查少于 50 字符的笔记
- 🧩 **智能插件** - 链接预览、自动计算器
- ⚡ **快捷码系统** - 自定义文本快捷输入
- 📜 **操作历史** - 支持查看和回滚笔记历史
- 🎨 **深色/浅色主题** - 支持主题切换
- 📂 **数据文件夹快速访问** - 点击路径直接打开文件管理器

### 🔧 技术改动
- 使用 Electron 27.3.11
- 使用 Electron IPC 替代 GitHub API
- 使用 Node.js fs 模块进行本地文件操作
- 自动生成多平台图标脚本
- 使用 Playwright 进行 E2E 测试
- TDD 开发流程，97.1% 测试覆盖率

### 📦 安装包
- macOS Intel: `WayneMemo-1.0.0.dmg` (152 MB)
- macOS Apple Silicon: `WayneMemo-1.0.0-arm64.dmg` (148 MB)
- Windows 安装版: `WayneMemo Setup 1.0.0.exe` (109 MB)
- Windows 便携版: `WayneMemo 1.0.0.exe` (109 MB)

### ⚠️ 重要说明
- **应用未签名**：首次安装需要手动允许运行
- **macOS 用户**：在"隐私与安全性"中点击"仍要打开"
- **Windows 用户**：SmartScreen 提示时点击"更多信息" → "仍要运行"
- 详见 [安装说明](INSTALLATION_NOTES.md)

### 🧪 测试覆盖
- 35 个 E2E 测试用例
- 34 个通过，1 个失败（非核心功能）
- 测试通过率：97.1%
- 跨平台兼容性验证通过

## 原 Memo 版本历史

详见 [Memo Changelog](https://github.com/btk/memo/blob/master/CHANGELOG.md)
