# WayneMemo 更新日志

## v1.0.0

### 新特性
- 完全离线化 - 移除 GitHub Gist 依赖，数据完全存储在本地
- 本地文件存储 - 笔记以 Markdown 格式保存在 `~/Documents/WayneMemo_Data/`
- 跨平台支持 - 支持 Windows、macOS Intel 和 Apple Silicon
- 中文本地化 - 完整的中文界面
- 品牌重塑 - 更名为 WayneMemo，全新 Logo

### 技术改动
- 使用 Electron IPC 替代 GitHub API
- 使用 Node.js fs 模块进行本地文件操作
- 自动生成多平台图标脚本
- 更新 Electron 至 28.x

## 原 Memo 版本历史

详见 [Memo Changelog](https://github.com/btk/memo/blob/master/CHANGELOG.md)
