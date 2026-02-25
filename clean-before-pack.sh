#!/bin/bash

# WayneMemo 打包前清理脚本
# 清理所有测试文件、缓存、临时文件和开发文档

echo "🧹 开始清理打包前的无用文件..."

# 1. 清理测试文件
echo "📝 清理测试文件..."
rm -rf e2e/
rm -rf playwright-report/
rm -f playwright.config.js
rm -f test*.js

# 2. 清理构建缓存
echo "🗑️  清理构建缓存..."
rm -rf build/
rm -rf dist/
rm -rf release-builds/
rm -rf node_modules/.cache/

# 3. 清理开发文档（保留用户文档）
echo "📄 清理开发文档..."
rm -f MANUAL_TEST_GUIDE.md
rm -f PLUGIN_INTEGRATION_GUIDE.md
rm -f ADDONS_USAGE.md
rm -f CLAUDE.md
rm -f TDD_IMPLEMENTATION_REPORT.md
rm -f DAILY_REVIEW_TDD_REPORT.md
rm -f COMPACT_MODE_OPTIMIZATION_REPORT.md
rm -f OPTIMIZATION_SUMMARY.md
rm -f IMPROVEMENTS_REPORT.md
rm -f INTEGRATION_TEST_REPORT.md
rm -f RELEASE_CHECKLIST.md

# 4. 清理临时文件
echo "🧼 清理临时文件..."
find . -name ".DS_Store" -delete
find . -name "*.tmp" -delete
find . -name "*.swp" -delete
find . -name "*.swo" -delete
find . -name "*~" -delete

# 5. 清理日志文件
echo "📋 清理日志文件..."
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*

# 6. 清理无用目录
echo "📁 清理无用目录..."
rm -rf .vscode/
rm -rf .idea/
rm -rf coverage/

# 7. 清理特定的无用文件
echo "🗂️  清理其他无用文件..."
# 清理可能存在的 Windows 路径文件
rm -rf "C:\\Users\\shenhongwei\\.claude\\plugins\\marketplaces\\claude-plugins-official/" 2>/dev/null

echo ""
echo "✅ 清理完成！"
echo ""
echo "📦 保留的文件："
echo "  - README.md (项目说明)"
echo "  - USER_GUIDE.md (用户指南)"
echo "  - CHANGELOG.md (更新日志)"
echo "  - LICENSE (许可证)"
echo "  - package.json (项目配置)"
echo "  - src/ (源代码)"
echo "  - public/ (公共资源)"
echo ""
echo "🚀 现在可以执行打包命令："
echo "  npm run build"
echo "  npm run dist:all"
