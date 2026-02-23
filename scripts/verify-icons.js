#!/usr/bin/env node
/**
 * WayneMemo 图标验证脚本
 * 检查所有必需的图标文件是否存在并符合规格
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 定义所有必需的图标文件
const REQUIRED_ICONS = {
  electron: {
    title: 'Electron 打包图标',
    files: [
      { path: 'src/assets/icons/mac/icon.icns', desc: 'macOS 应用图标' },
      { path: 'src/assets/icons/win/icon.ico', desc: 'Windows 应用图标' },
      { path: 'src/assets/icons/png/16x16.png', desc: '16x16 PNG' },
      { path: 'src/assets/icons/png/24x24.png', desc: '24x24 PNG' },
      { path: 'src/assets/icons/png/32x32.png', desc: '32x32 PNG' },
      { path: 'src/assets/icons/png/48x48.png', desc: '48x48 PNG' },
      { path: 'src/assets/icons/png/64x64.png', desc: '64x64 PNG' },
      { path: 'src/assets/icons/png/128x128.png', desc: '128x128 PNG' },
      { path: 'src/assets/icons/png/256x256.png', desc: '256x256 PNG' },
      { path: 'src/assets/icons/png/512x512.png', desc: '512x512 PNG' },
      { path: 'src/assets/icons/png/1024x1024.png', desc: '1024x1024 PNG' }
    ]
  },
  pwa: {
    title: 'PWA/Web 图标',
    files: [
      { path: 'public/favicon.ico', desc: '浏览器标签图标' },
      { path: 'public/images/icons/icon-72x72.png', desc: 'PWA 72x72' },
      { path: 'public/images/icons/icon-96x96.png', desc: 'PWA 96x96' },
      { path: 'public/images/icons/icon-128x128.png', desc: 'PWA 128x128' },
      { path: 'public/images/icons/icon-144x144.png', desc: 'PWA 144x144' },
      { path: 'public/images/icons/icon-152x152.png', desc: 'PWA 152x152' },
      { path: 'public/images/icons/icon-192x192.png', desc: 'PWA 192x192' },
      { path: 'public/images/icons/icon-384x384.png', desc: 'PWA 384x384' },
      { path: 'public/images/icons/icon-512x512.png', desc: 'PWA 512x512' }
    ]
  },
  frontend: {
    title: '前端界面 Logo',
    files: [
      { path: 'src/assets/memo_logo_left.svg', desc: '浅色主题 Logo (SVG)' },
      { path: 'src/assets/memo_logo_left_white.svg', desc: '深色主题 Logo (SVG)' },
      { path: 'src/assets/memo_desktop.svg', desc: '桌面版 Logo (SVG)' },
      { path: 'resources/icon.png', desc: 'Electron 资源图标' }
    ]
  }
};

// 检查文件是否存在
function checkFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    return { exists: true, size: sizeKB + ' KB' };
  }
  return { exists: false, size: '-' };
}

// 获取图片尺寸
function getImageDimensions(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    // 尝试使用 file 命令获取尺寸
    const result = execSync(`file "${fullPath}"`, { encoding: 'utf-8' });
    const match = result.match(/(\d+) x (\d+)/);
    if (match) {
      return `${match[1]}x${match[2]}`;
    }
  } catch (e) {
    // 忽略错误
  }
  return '-';
}

// 主函数
function main() {
  console.log('🔍 WayneMemo 图标验证工具\n');

  let totalFiles = 0;
  let existingFiles = 0;
  let missingFiles = [];

  for (const [category, data] of Object.entries(REQUIRED_ICONS)) {
    console.log(`\n📁 ${data.title}`);
    console.log('─'.repeat(60));
    console.log(`${'文件路径'.padEnd(45)} ${'状态'.padEnd(8)} ${'大小'.padEnd(10)}`);
    console.log('─'.repeat(60));

    for (const file of data.files) {
      totalFiles++;
      const result = checkFile(file.path);
      const status = result.exists ? '✅ 存在' : '❌ 缺失';

      if (result.exists) {
        existingFiles++;
      } else {
        missingFiles.push(file.path);
      }

      const displayPath = file.path.length > 42 ? '...' + file.path.slice(-40) : file.path;
      console.log(`${displayPath.padEnd(45)} ${status.padEnd(8)} ${result.size.padEnd(10)}`);
    }
  }

  // 检查代码引用
  console.log('\n\n📋 代码引用检查');
  console.log('─'.repeat(60));

  const codeRefs = [
    { file: 'src/components/AppBar/index.js', pattern: 'memo_logo_left', desc: '标题栏 Logo' },
    { file: 'src/components/Loading/index.js', pattern: 'memo_logo_left', desc: '加载页 Logo' },
    { file: 'src/tabs/Settings/index.js', pattern: 'memo_logo_left', desc: '设置页主题预览' }
  ];

  for (const ref of codeRefs) {
    const fullPath = path.join(__dirname, '..', ref.file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const found = content.includes(ref.pattern);
      console.log(`${ref.desc.padEnd(20)} ${found ? '✅ 已引用' : '⚠️  未引用'} ${ref.file}`);
    }
  }

  // 总结
  console.log('\n\n📊 验证总结');
  console.log('─'.repeat(60));
  console.log(`总文件数: ${totalFiles}`);
  console.log(`已存在: ${existingFiles}`);
  console.log(`缺失: ${totalFiles - existingFiles}`);
  console.log(`完成度: ${((existingFiles / totalFiles) * 100).toFixed(1)}%`);

  if (missingFiles.length > 0) {
    console.log('\n❌ 缺失文件列表:');
    missingFiles.forEach(f => console.log(`   - ${f}`));
    console.log('\n💡 提示: 运行 node scripts/generate-icons.js 生成图标');
    process.exit(1);
  } else {
    console.log('\n✅ 所有图标文件已就绪！');
    console.log('\n📝 下一步:');
    console.log('   1. 确保 SVG Logo 已更新为 WayneMemo 品牌');
    console.log('   2. 运行 npm run build 测试');
    console.log('   3. 运行 npm run pack:mac (或 pack:win) 测试打包');
  }
}

main();
