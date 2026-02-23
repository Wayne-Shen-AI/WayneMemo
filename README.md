# WayneMemo

<img src="src/assets/memo_logo_left.png" width="159" height="42"/>

WayneMemo 是一个完全离线的本地笔记应用，基于开源项目 [Memo](https://github.com/btk/memo) 开发。所有数据存储在本地，无需网络连接，保护您的隐私。

## 特性

- 完全离线 - 所有数据保存在本地，无需网络
- 本地文件存储 - 笔记以 Markdown 格式存储在本地文件夹
- 双栏编辑器 - 左侧编辑，右侧实时预览
- 深色/浅色主题 - 支持自定义主题
- 智能搜索 - 快速查找笔记内容
- 自动保存 - 编辑内容自动保存
- 跨平台 - 支持 Windows、macOS (Intel & Apple Silicon)

## 数据存储位置

您的笔记数据保存在以下位置：

- **macOS**: `~/Documents/WayneMemo_Data/`
- **Windows**: `C:\Users\<用户名>\Documents\WayneMemo_Data\`

数据文件格式：
- `metadata.json` - 笔记索引和配置
- `notes/*.md` - Markdown 格式的笔记内容

## 安装

从 [Releases](https://github.com/WayneShen2007/WayneMemo/releases) 页面下载对应平台的安装包：

- **macOS Apple Silicon**: `WayneMemo-1.0.0-arm64.dmg`
- **macOS Intel**: `WayneMemo-1.0.0.dmg`
- **Windows**: `WayneMemo Setup 1.0.0.exe`

## 开发

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm start
```

### 构建应用

```bash
# macOS (Intel + Apple Silicon)
npm run dist:mac

# Windows
npm run dist:win

# 所有平台
npm run dist:all
```

## 技术栈

- Electron 28
- React 16
- JsStore (IndexedDB)
- marked (Markdown 渲染)

## 许可证

GPLv3

## 致谢

基于 [Memo](https://github.com/btk/memo) 开源项目开发。
