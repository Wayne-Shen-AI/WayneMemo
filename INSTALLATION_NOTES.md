# WayneMemo 安装说明

## ⚠️ 重要提示：应用签名问题

### 当前状态

WayneMemo v1.0.0 的安装包**未经过 Apple 开发者签名**，这会导致以下问题：

#### macOS 用户首次安装时会遇到：

1. **打开 DMG 后拖动到应用程序文件夹**
2. **首次启动时会提示："无法打开 WayneMemo，因为无法验证开发者"**

---

## 🔧 解决方案

### macOS 用户（Intel 和 Apple Silicon）

#### 方法一：通过"安全性与隐私"允许（推荐）

1. **双击打开 DMG 文件**
   - Intel Mac: `WayneMemo-1.0.0.dmg`
   - Apple Silicon Mac: `WayneMemo-1.0.0-arm64.dmg`

2. **拖动 WayneMemo 到应用程序文件夹**

3. **首次启动**
   - 在"启动台"或"应用程序"文件夹中找到 WayneMemo
   - 双击打开，会提示无法打开

4. **在系统设置中允许**
   - 打开"系统设置"（System Settings）
   - 进入"隐私与安全性"（Privacy & Security）
   - 向下滚动，找到"安全性"部分
   - 会看到："WayneMemo 已被阻止使用"
   - 点击"仍要打开"（Open Anyway）
   - 再次确认"打开"

5. **后续启动**
   - 第一次允许后，以后就可以正常启动了

#### 方法二：通过终端移除隔离属性（高级用户）

```bash
# 打开终端，执行以下命令
xattr -cr /Applications/WayneMemo.app

# 或者在拖入应用程序文件夹之前
xattr -cr ~/Downloads/WayneMemo.app
```

#### 方法三：右键菜单打开（简单）

1. 在"应用程序"文件夹中找到 WayneMemo
2. **按住 Control 键点击**（或右键点击）
3. 选择"打开"
4. 在弹出的对话框中点击"打开"
5. 后续就可以正常双击启动了

---

### Windows 用户

Windows 版本同样未签名，可能会遇到：

#### 安装版（WayneMemo Setup 1.0.0.exe）

1. **Windows Defender SmartScreen 提示**
   - 双击安装程序
   - 可能提示："Windows 已保护你的电脑"
   - 点击"更多信息"
   - 点击"仍要运行"

2. **安装过程**
   - 按提示完成安装
   - 首次启动可能再次提示，选择"仍要运行"

#### 便携版（WayneMemo 1.0.0.exe）

1. 直接运行可能提示 SmartScreen
2. 点击"更多信息" → "仍要运行"

---

## 🔐 为什么会有这些提示？

### 应用未签名的原因

1. **Apple 开发者签名需要：**
   - Apple Developer 账号（$99/年）
   - 开发者证书
   - 公证（Notarization）流程

2. **Windows 代码签名需要：**
   - 代码签名证书（$100-$400/年）
   - 签名工具和流程

3. **当前版本是开源项目，未购买签名证书**

### 安全性说明

- ✅ **WayneMemo 是开源项目，代码完全透明**
- ✅ **所有数据存储在本地，完全离线**
- ✅ **不连接任何外部服务器**
- ✅ **不收集任何用户数据**
- ✅ **源代码可在 GitHub 上查看**

**这些系统提示是正常的，是因为应用未经过付费的开发者签名，并不意味着应用不安全。**

---

## 📋 详细安装步骤

### macOS Intel 用户

1. 下载 `WayneMemo-1.0.0.dmg` (152 MB)
2. 双击打开 DMG 文件
3. 拖动 WayneMemo 到应用程序文件夹
4. 首次启动使用上述"方法一"或"方法三"
5. 允许后正常使用

### macOS Apple Silicon 用户（M1/M2/M3）

1. 下载 `WayneMemo-1.0.0-arm64.dmg` (148 MB)
2. 双击打开 DMG 文件
3. 拖动 WayneMemo 到应用程序文件夹
4. 首次启动使用上述"方法一"或"方法三"
5. 允许后正常使用

**注意：ARM 版本已经有 adhoc 签名，但仍需要手动允许首次运行。**

### Windows 用户

#### 安装版（推荐）

1. 下载 `WayneMemo Setup 1.0.0.exe` (109 MB)
2. 双击运行安装程序
3. 如遇 SmartScreen 提示：
   - 点击"更多信息"
   - 点击"仍要运行"
4. 按提示完成安装
5. 从开始菜单启动 WayneMemo

#### 便携版

1. 下载 `WayneMemo 1.0.0.exe` (109 MB)
2. 放到任意文件夹
3. 双击运行
4. 如遇 SmartScreen 提示，同上处理

---

## 🔍 验证应用完整性

### macOS 用户可以验证签名状态

```bash
# 查看应用签名信息
codesign -dv --verbose=4 /Applications/WayneMemo.app

# ARM 版本会显示 "adhoc" 签名
# Intel 版本会显示 "not signed"
```

### 验证应用来源

- GitHub 仓库：https://github.com/Wayne-Shen-AI/WayneMemo
- 源代码完全公开
- 可自行从源码构建

---

## ❓ 常见问题

### Q1: 为什么 macOS 说"无法打开"？
**A**: 因为应用未经过 Apple 开发者签名。使用上述方法一或方法三即可解决。

### Q2: 这个应用安全吗？
**A**: 是的！WayneMemo 是开源项目，代码透明，完全离线运行，不收集任何数据。

### Q3: ARM 版本和 Intel 版本有什么区别？
**A**:
- ARM 版本（arm64）：为 M1/M2/M3 芯片优化，性能更好
- Intel 版本（x64）：为 Intel 芯片 Mac 设计
- 两个版本都有 adhoc 签名，但都需要手动允许首次运行

### Q4: 能否获得签名版本？
**A**: 未来版本可能会提供签名版本。当前版本可以通过上述方法安全使用。

### Q5: Windows Defender 说有风险？
**A**: 这是因为应用未签名。WayneMemo 是开源项目，完全安全。点击"更多信息" → "仍要运行"即可。

### Q6: 我不想手动允许，有其他办法吗？
**A**: 可以使用终端命令移除隔离属性（方法二），或者等待未来的签名版本。

---

## 🆘 需要帮助？

如果遇到其他问题：

1. 查看 [用户指南](USER_GUIDE.md)
2. 访问 [GitHub Issues](https://github.com/Wayne-Shen-AI/WayneMemo/issues)
3. 提交新的 Issue 描述问题

---

## 📝 技术说明

### 当前签名状态

| 平台 | 签名类型 | Gatekeeper | 说明 |
|------|---------|-----------|------|
| macOS Intel | 未签名 | ❌ 需手动允许 | 需要在系统设置中允许 |
| macOS ARM | adhoc 签名 | ❌ 需手动允许 | 有本地签名，但仍需允许 |
| Windows | 未签名 | ❌ SmartScreen 提示 | 需要点击"仍要运行" |

### 未来计划

- [ ] 考虑购买 Apple Developer 账号进行签名
- [ ] 考虑购买 Windows 代码签名证书
- [ ] 提供自动化签名构建流程

---

## ✅ 总结

**WayneMemo 可以安全使用，只是需要手动允许首次运行。**

- **macOS 用户**：首次启动时在"隐私与安全性"中点击"仍要打开"
- **Windows 用户**：遇到 SmartScreen 时点击"更多信息" → "仍要运行"
- **完全安全**：开源项目，代码透明，完全离线

**按照上述步骤操作后，应用就可以正常使用了！** 🎉

---

**版本**: v1.0.0
**更新日期**: 2026-02-25
**开发者**: Wayne Shen
