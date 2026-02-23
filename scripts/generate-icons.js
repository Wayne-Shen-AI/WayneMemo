#!/usr/bin/env node
/**
 * WayneMemo 图标生成脚本
 * 从 512x512 源图生成所有平台所需的图标尺寸
 *
 * 使用方法:
 * 1. 将 512x512 的 logo 命名为 waynememo_logo.png 放在项目根目录
 * 2. 运行: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const SOURCE_IMAGE = path.join(__dirname, '..', 'waynememo_logo.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'generated_icons');

// PNG 尺寸列表
const PNG_SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

// 输出路径配置
const OUTPUT_PATHS = {
  png: path.join(OUTPUT_DIR, 'png'),
  mac: path.join(OUTPUT_DIR, 'mac'),
  win: path.join(OUTPUT_DIR, 'win'),
  pwa: path.join(OUTPUT_DIR, 'pwa')
};

// 检查源文件
function checkSource() {
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ 错误: 找不到源文件 waynememo_logo.png');
    console.error('   请将 512x512 的 logo 命名为 waynememo_logo.png 放在项目根目录');
    process.exit(1);
  }
  console.log('✅ 找到源文件: waynememo_logo.png');
}

// 创建输出目录
function createOutputDirs() {
  Object.values(OUTPUT_PATHS).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  console.log('✅ 创建输出目录');
}

// 检查是否安装了 sharp
function checkSharp() {
  try {
    require('sharp');
    return true;
  } catch (e) {
    return false;
  }
}

// 安装 sharp
function installSharp() {
  console.log('📦 正在安装 sharp 库...');
  try {
    execSync('npm install sharp --save-dev', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log('✅ sharp 安装完成');
  } catch (e) {
    console.error('❌ 安装 sharp 失败，请手动运行: npm install sharp --save-dev');
    process.exit(1);
  }
}

// 生成 PNG 图标
async function generatePNGIcons() {
  const sharp = require('sharp');
  console.log('\n🎨 生成 PNG 图标...');

  for (const size of PNG_SIZES) {
    const outputFile = path.join(OUTPUT_PATHS.png, `${size}x${size}.png`);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(outputFile);
    console.log(`   ✓ ${size}x${size}.png`);
  }
}

// 生成 PWA 图标
async function generatePWAIcons() {
  const sharp = require('sharp');
  console.log('\n🎨 生成 PWA 图标...');

  const pwaSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  for (const size of pwaSizes) {
    const outputFile = path.join(OUTPUT_PATHS.pwa, `icon-${size}x${size}.png`);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(outputFile);
    console.log(`   ✓ icon-${size}x${size}.png`);
  }
}

// 生成 macOS ICNS
async function generateMacIcons() {
  console.log('\n🎨 生成 macOS ICNS 图标...');

  const sharp = require('sharp');
  const macDir = path.join(OUTPUT_PATHS.mac, 'icon.iconset');
  fs.mkdirSync(macDir, { recursive: true });

  // macOS 需要的尺寸
  const macSizes = [
    { size: 16, name: 'icon_16x16' },
    { size: 32, name: 'icon_16x16@2x' },
    { size: 32, name: 'icon_32x32' },
    { size: 64, name: 'icon_32x32@2x' },
    { size: 128, name: 'icon_128x128' },
    { size: 256, name: 'icon_128x128@2x' },
    { size: 256, name: 'icon_256x256' },
    { size: 512, name: 'icon_256x256@2x' },
    { size: 512, name: 'icon_512x512' },
    { size: 1024, name: 'icon_512x512@2x' }
  ];

  for (const { size, name } of macSizes) {
    const outputFile = path.join(macDir, `${name}.png`);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(outputFile);
  }

  // 使用 iconutil 生成 icns（仅在 macOS 上可用）
  try {
    const icnsOutput = path.join(OUTPUT_PATHS.mac, 'icon.icns');
    execSync(`iconutil -c icns "${macDir}" -o "${icnsOutput}"`, { stdio: 'ignore' });
    console.log('   ✓ icon.icns');

    // 清理临时文件
    fs.rmSync(macDir, { recursive: true, force: true });
  } catch (e) {
    console.log('   ⚠️  无法生成 .icns（需要 macOS），请使用在线工具转换:');
    console.log('      https://iconverticons.com/online/');
    console.log('      上传以下文件:', macDir);
  }
}

// 生成 Windows ICO
async function generateWindowsIcons() {
  console.log('\n🎨 生成 Windows ICO 图标...');

  try {
    // 尝试使用 sharp 和 to-ico
    const toIco = require('to-ico');
    const sharp = require('sharp');

    const sizes = [16, 24, 32, 48, 64, 128, 256];
    const pngBuffers = [];

    for (const size of sizes) {
      const buffer = await sharp(SOURCE_IMAGE)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
      pngBuffers.push(buffer);
    }

    const icoBuffer = await toIco(pngBuffers);
    fs.writeFileSync(path.join(OUTPUT_PATHS.win, 'icon.ico'), icoBuffer);
    console.log('   ✓ icon.ico');
  } catch (e) {
    console.log('   ⚠️  无法自动生成 .ico，请使用在线工具转换:');
    console.log('      https://convertio.co/png-ico/');
    console.log('      建议包含尺寸: 16, 24, 32, 48, 64, 128, 256');
  }
}

// 复制到项目目录
function copyToProject() {
  console.log('\n📋 复制图标到项目目录...');

  const projectPaths = {
    png: path.join(__dirname, '..', 'src', 'assets', 'icons', 'png'),
    pwa: path.join(__dirname, '..', 'public', 'images', 'icons'),
    mac: path.join(__dirname, '..', 'src', 'assets', 'icons', 'mac'),
    win: path.join(__dirname, '..', 'src', 'assets', 'icons', 'win'),
    resources: path.join(__dirname, '..', 'resources')
  };

  // 复制 PNG 图标
  fs.readdirSync(OUTPUT_PATHS.png).forEach(file => {
    fs.copyFileSync(
      path.join(OUTPUT_PATHS.png, file),
      path.join(projectPaths.png, file)
    );
  });
  console.log('   ✓ 复制到 src/assets/icons/png/');

  // 复制 PWA 图标
  fs.readdirSync(OUTPUT_PATHS.pwa).forEach(file => {
    fs.copyFileSync(
      path.join(OUTPUT_PATHS.pwa, file),
      path.join(projectPaths.pwa, file)
    );
  });
  console.log('   ✓ 复制到 public/images/icons/');

  // 复制 macOS 图标
  const icnsSource = path.join(OUTPUT_PATHS.mac, 'icon.icns');
  if (fs.existsSync(icnsSource)) {
    fs.copyFileSync(icnsSource, path.join(projectPaths.mac, 'icon.icns'));
    console.log('   ✓ 复制到 src/assets/icons/mac/');
  }

  // 复制 Windows 图标
  const icoSource = path.join(OUTPUT_PATHS.win, 'icon.ico');
  if (fs.existsSync(icoSource)) {
    fs.copyFileSync(icoSource, path.join(projectPaths.win, 'icon.ico'));
    console.log('   ✓ 复制到 src/assets/icons/win/');
  }

  // 复制到 resources
  fs.copyFileSync(
    path.join(OUTPUT_PATHS.png, '256x256.png'),
    path.join(projectPaths.resources, 'icon.png')
  );
  console.log('   ✓ 复制到 resources/');

  // 生成 favicon.ico (使用 256x256 版本)
  const faviconSource = path.join(OUTPUT_PATHS.png, '256x256.png');
  if (fs.existsSync(faviconSource)) {
    try {
      fs.copyFileSync(icoSource, path.join(__dirname, '..', 'public', 'favicon.ico'));
      console.log('   ✓ 复制 favicon.ico');
    } catch (e) {
      // 如果 ico 不存在，复制 png 作为备用
    }
  }
}

// 创建备份
function createBackup() {
  const backupDir = path.join(__dirname, '..', 'backup_icons', Date.now().toString());
  fs.mkdirSync(backupDir, { recursive: true });

  const dirsToBackup = [
    'src/assets/icons/png',
    'src/assets/icons/mac',
    'src/assets/icons/win',
    'public/images/icons',
    'resources'
  ];

  dirsToBackup.forEach(dir => {
    const sourceDir = path.join(__dirname, '..', dir);
    const targetDir = path.join(backupDir, dir);
    if (fs.existsSync(sourceDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      fs.readdirSync(sourceDir).forEach(file => {
        fs.copyFileSync(
          path.join(sourceDir, file),
          path.join(targetDir, file)
        );
      });
    }
  });

  console.log(`✅ 已备份原图标到: backup_icons/${Date.now()}/`);
  return backupDir;
}

// 主函数
async function main() {
  console.log('🚀 WayneMemo 图标生成工具（直接覆盖模式）\n');
  console.log('⚠️  此脚本将直接替换项目中的图标文件\n');

  checkSource();

  // 创建备份
  createBackup();

  // 直接使用项目目录作为输出
  const projectPaths = {
    png: path.join(__dirname, '..', 'src', 'assets', 'icons', 'png'),
    pwa: path.join(__dirname, '..', 'public', 'images', 'icons'),
    mac: path.join(__dirname, '..', 'src', 'assets', 'icons', 'mac'),
    win: path.join(__dirname, '..', 'src', 'assets', 'icons', 'win'),
    resources: path.join(__dirname, '..', 'resources')
  };

  // 确保目录存在
  Object.values(projectPaths).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  if (!checkSharp()) {
    installSharp();
  }

  const sharp = require('sharp');

  try {
    // 生成 PNG 图标（直接到项目目录）
    console.log('\n🎨 生成 PNG 图标...');
    for (const size of PNG_SIZES) {
      await sharp(SOURCE_IMAGE)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(projectPaths.png, `${size}x${size}.png`));
      console.log(`   ✓ src/assets/icons/png/${size}x${size}.png`);
    }

    // 生成 PWA 图标（直接到项目目录）
    console.log('\n🎨 生成 PWA 图标...');
    const pwaSizes = [72, 96, 128, 144, 152, 192, 384, 512];
    for (const size of pwaSizes) {
      await sharp(SOURCE_IMAGE)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(projectPaths.pwa, `icon-${size}x${size}.png`));
      console.log(`   ✓ public/images/icons/icon-${size}x${size}.png`);
    }

    // 生成 macOS ICNS
    console.log('\n🎨 生成 macOS ICNS 图标...');
    const macDir = path.join(__dirname, '..', 'temp_icon.iconset');
    fs.mkdirSync(macDir, { recursive: true });

    const macSizes = [
      { size: 16, name: 'icon_16x16' },
      { size: 32, name: 'icon_16x16@2x' },
      { size: 32, name: 'icon_32x32' },
      { size: 64, name: 'icon_32x32@2x' },
      { size: 128, name: 'icon_128x128' },
      { size: 256, name: 'icon_128x128@2x' },
      { size: 256, name: 'icon_256x256' },
      { size: 512, name: 'icon_256x256@2x' },
      { size: 512, name: 'icon_512x512' },
      { size: 1024, name: 'icon_512x512@2x' }
    ];

    for (const { size, name } of macSizes) {
      await sharp(SOURCE_IMAGE)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(macDir, `${name}.png`));
    }

    try {
      execSync(`iconutil -c icns "${macDir}" -o "${path.join(projectPaths.mac, 'icon.icns')}"`, { stdio: 'ignore' });
      console.log(`   ✓ src/assets/icons/mac/icon.icns`);
      fs.rmSync(macDir, { recursive: true, force: true });
    } catch (e) {
      console.log('   ⚠️  无法生成 .icns（需要 macOS），请手动转换');
    }

    // 生成 Windows ICO
    console.log('\n🎨 生成 Windows ICO 图标...');
    try {
      const toIco = require('to-ico');
      const sizes = [16, 24, 32, 48, 64, 128, 256];
      const pngBuffers = [];
      for (const size of sizes) {
        const buffer = await sharp(SOURCE_IMAGE)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        pngBuffers.push(buffer);
      }
      const icoBuffer = await toIco(pngBuffers);
      fs.writeFileSync(path.join(projectPaths.win, 'icon.ico'), icoBuffer);
      console.log(`   ✓ src/assets/icons/win/icon.ico`);
    } catch (e) {
      console.log('   ⚠️  无法自动生成 .ico，请使用在线工具转换');
    }

    // 更新 resources/icon.png
    await sharp(SOURCE_IMAGE)
      .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(projectPaths.resources, 'icon.png'));
    console.log(`   ✓ resources/icon.png`);

    console.log('\n✅ 所有 PNG/ICO/ICNS 图标已替换！');
    console.log('\n📝 手动替换清单（需要 SVG 版本）:');
    console.log('   1. src/assets/memo_logo_left.svg - 浅色背景 Logo');
    console.log('   2. src/assets/memo_logo_left_white.svg - 深色背景 Logo');
    console.log('\n💡 提示: SVG 需要使用设计工具（如 Illustrator、Figma）导出');
    console.log('\n🔍 运行 node scripts/verify-icons.js 验证替换结果');

  } catch (e) {
    console.error('\n❌ 错误:', e.message);
    process.exit(1);
  }
}

main();
