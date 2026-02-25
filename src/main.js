// Modules to control application life and create native browser window
const {app, BrowserWindow, shell, ipcMain, globalShortcut, Notification} = require('electron')
const fs = require('fs')
const path = require('path')

// Keep a global reference of the window object
let mainWindow

// 本地数据存储目录（延迟初始化，等待 Electron ready）
let DATA_DIR, NOTES_DIR, METADATA_FILE, SNIPPETS_FILE, OPERATION_LOGS_FILE

function initPaths() {
  if (!DATA_DIR) {
    DATA_DIR = path.join(app.getPath('documents'), 'WayneMemo_Data')
    NOTES_DIR = path.join(DATA_DIR, 'notes')
    METADATA_FILE = path.join(DATA_DIR, 'metadata.json')
    SNIPPETS_FILE = path.join(DATA_DIR, 'snippets.json')
    OPERATION_LOGS_FILE = path.join(DATA_DIR, 'operation_logs.json')
  }
}

// 确保数据目录存在
function ensureDataDir() {
  initPaths()
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true })
  }
  // 初始化 metadata 文件
  if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify({
      version: 1,
      lastId: 0,
      notes: [],
      userRole: null,
      enabledSkills: ['quickSearch', 'history']
    }, null, 2))
  } else {
    // 版本迁移：确保旧数据文件包含新字段
    try {
      const data = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'))
      let needsUpdate = false
      if (data.userRole === undefined) {
        data.userRole = null
        needsUpdate = true
      }
      if (data.enabledSkills === undefined) {
        data.enabledSkills = ['quickSearch', 'history']
        needsUpdate = true
      }
      if (data.version === undefined) {
        data.version = 1
        needsUpdate = true
      }
      if (needsUpdate) {
        fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2))
        console.log('Metadata migrated to version 1')
      }
    } catch (e) {
      console.error('Failed to migrate metadata:', e)
    }
  }
  // 初始化 snippets 文件
  if (!fs.existsSync(SNIPPETS_FILE)) {
    fs.writeFileSync(SNIPPETS_FILE, JSON.stringify({
      snippets: [
        {
          id: 1,
          alias: '待办',
          content: '- [ ] 待办事项1\n- [ ] 待办事项2\n- [ ] 待办事项3',
          description: '待办清单模板',
          usageCount: 0,
          createdAt: Math.round(Date.now() / 1000)
        },
        {
          id: 2,
          alias: '会议',
          content: '## 会议记录\n\n**时间：** \n**参与人：** \n\n### 议题\n\n### 结论\n\n### 行动项\n- [ ] ',
          description: '会议记录模板',
          usageCount: 0,
          createdAt: Math.round(Date.now() / 1000)
        },
        {
          id: 3,
          alias: '日报',
          content: '## 工作日报\n\n**日期：** \n\n### 今日完成\n\n### 明日计划\n\n### 遇到的问题',
          description: '日报模板',
          usageCount: 0,
          createdAt: Math.round(Date.now() / 1000)
        },
        {
          id: 4,
          alias: 'bug',
          content: '## Bug 记录\n\n**现象：** \n**复现步骤：** \n**期望结果：** \n**实际结果：** \n**环境：** ',
          description: 'Bug 报告模板',
          usageCount: 0,
          createdAt: Math.round(Date.now() / 1000)
        },
        {
          id: 5,
          alias: 'mtg',
          content: '## 会议记录\n\n**时间：** \n**参与人：** \n\n### 议题\n\n### 结论\n\n### 行动项\n- [ ] ',
          description: '会议记录模板',
          usageCount: 0,
          createdAt: Math.round(Date.now() / 1000)
        },
        {
          id: 6,
          alias: 'weekly',
          content: '## 周记\n\n**第 周**\n\n### 本周总结\n\n### 下周计划\n\n### 个人思考',
          description: '周记模板',
          usageCount: 0,
          createdAt: Math.round(Date.now() / 1000)
        },
        {
          id: 7,
          alias: 'code',
          content: '```\n\n```',
          description: '代码块',
          usageCount: 0,
          createdAt: Math.round(Date.now() / 1000)
        },
        {
          id: 8,
          alias: 'todo',
          content: '- [ ] ',
          description: '待办事项',
          usageCount: 0,
          createdAt: Math.round(Date.now() / 1000)
        },
        {
          id: 9,
          alias: 'link',
          content: '[](http://)',
          description: '链接格式',
          usageCount: 0,
          createdAt: Math.round(Date.now() / 1000)
        }
      ]
    }, null, 2))
  } else {
    // 文件已存在，检查并添加新的系统默认模板
    try {
      const data = JSON.parse(fs.readFileSync(SNIPPETS_FILE, 'utf-8'))
      const existingAliases = new Set(data.snippets.map(s => s.alias))
      const defaultSnippets = [
        { id: 5, alias: 'mtg', content: '## 会议记录\n\n**时间：** \n**参与人：** \n\n### 议题\n\n### 结论\n\n### 行动项\n- [ ] ', description: '会议记录模板' },
        { id: 6, alias: 'weekly', content: '## 周记\n\n**第 周**\n\n### 本周总结\n\n### 下周计划\n\n### 个人思考', description: '周记模板' },
        { id: 7, alias: 'code', content: '```\n\n```', description: '代码块' },
        { id: 8, alias: 'todo', content: '- [ ] ', description: '待办事项' },
        { id: 9, alias: 'link', content: '[](http://)', description: '链接格式' }
      ]

      let added = false
      defaultSnippets.forEach(template => {
        if (!existingAliases.has(template.alias)) {
          data.snippets.push({
            ...template,
            usageCount: 0,
            createdAt: Math.round(Date.now() / 1000)
          })
          added = true
        }
      })

      if (added) {
        fs.writeFileSync(SNIPPETS_FILE, JSON.stringify(data, null, 2))
      }
    } catch (e) {
      console.error('更新 snippets 失败:', e)
    }
  }
  // 初始化 operation_logs 文件
  if (!fs.existsSync(OPERATION_LOGS_FILE)) {
    fs.writeFileSync(OPERATION_LOGS_FILE, JSON.stringify({
      logs: []
    }, null, 2))
  }
}

// 默认元数据（包含所有新字段，确保向后兼容）
const DEFAULT_METADATA = {
  version: 1,
  lastId: 0,
  notes: [],
  userRole: null,
  enabledSkills: ['quickSearch', 'history']
}

// 读取元数据
function readMetadata() {
  initPaths()
  try {
    const data = fs.readFileSync(METADATA_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    // 合并默认值，确保旧数据文件升级时包含新字段
    return { ...DEFAULT_METADATA, ...parsed }
  } catch (e) {
    return { ...DEFAULT_METADATA }
  }
}

// 写入元数据
function writeMetadata(metadata) {
  initPaths()
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2))
}

// 生成笔记文件名
function getNoteFileName(id) {
  initPaths()
  return path.join(NOTES_DIR, `note-${id}.md`)
}

// 注册 IPC 处理器
function registerIpcHandlers() {
  // IPC: 获取笔记列表
  ipcMain.handle('get-notes-list', async () => {
    const metadata = readMetadata()
    const notes = metadata.notes
      .filter(note => note.active !== 0)
      .map(note => {
        const notePath = getNoteFileName(note.id)
        let content = ''
        if (fs.existsSync(notePath)) {
          content = fs.readFileSync(notePath, 'utf-8')
        }
        // 提取第一行非空文本作为预览
        const lines = content.split('\n').filter(line => line.trim())
        const firstLine = lines[0] || ''
        return {
          id: note.id,
          title: note.title,
          active: note.active,
          created_at: note.created_at,
          accessed_at: note.accessed_at,
          first_line: firstLine.replace(/^#+\s*/, '').substring(0, 100),
          line_count: content.split('\n').length
        }
      })
    // 按访问时间降序排列
    notes.sort((a, b) => b.accessed_at - a.accessed_at)
    return notes
  })

  // IPC: 获取归档笔记列表
  ipcMain.handle('get-archived-notes', async () => {
    const metadata = readMetadata()
    const notes = metadata.notes
      .filter(note => note.active === 0)
      .map(note => {
        const notePath = getNoteFileName(note.id)
        let content = ''
        if (fs.existsSync(notePath)) {
          content = fs.readFileSync(notePath, 'utf-8')
        }
        const lines = content.split('\n').filter(line => line.trim())
        const firstLine = lines[0] || ''
        return {
          id: note.id,
          title: note.title,
          active: note.active,
          created_at: note.created_at,
          accessed_at: note.accessed_at,
          first_line: firstLine.replace(/^#+\s*/, '').substring(0, 100),
          line_count: content.split('\n').length
        }
      })
    notes.sort((a, b) => b.accessed_at - a.accessed_at)
    return notes
  })

  // IPC: 获取单条笔记
  ipcMain.handle('get-note', async (event, noteId) => {
    const metadata = readMetadata()
    const noteMeta = metadata.notes.find(n => n.id === noteId)
    if (!noteMeta) return null

    const notePath = getNoteFileName(noteId)
    let content = ''
    if (fs.existsSync(notePath)) {
      content = fs.readFileSync(notePath, 'utf-8')
    }

    // 更新访问时间
    noteMeta.accessed_at = Math.round(Date.now() / 1000)
    writeMetadata(metadata)

    // 解析内容为 lines 格式
    const lines = content.split('\n').map((text, index) => ({
      line_key: `line-${index}`,
      date: new Date(noteMeta.created_at * 1000).toLocaleDateString(),
      text: text,
      pos: index
    }))

    return {
      id: noteMeta.id,
      title: noteMeta.title,
      active: noteMeta.active,
      created_at: noteMeta.created_at,
      accessed_at: noteMeta.accessed_at,
      lines: lines
    }
  })

  // IPC: 新建笔记
  ipcMain.handle('create-note', async (event, title) => {
    const metadata = readMetadata()
    const now = Math.round(Date.now() / 1000)
    const newId = metadata.lastId + 1
    metadata.lastId = newId

    const newNote = {
      id: newId,
      title: title || 'Untitled Sheet',
      active: 1,
      created_at: now,
      accessed_at: now
    }

    metadata.notes.push(newNote)
    writeMetadata(metadata)

    // 创建空笔记文件
    const notePath = getNoteFileName(newId)
    fs.writeFileSync(notePath, '')

    return newNote
  })

  // IPC: 更新笔记
  ipcMain.handle('update-note', async (event, { id, title, content }) => {
    const metadata = readMetadata()
    const noteMeta = metadata.notes.find(n => n.id === id)
    if (!noteMeta) return { success: false, error: 'Note not found' }

    if (title !== undefined) {
      noteMeta.title = title
    }
    noteMeta.accessed_at = Math.round(Date.now() / 1000)

    if (content !== undefined) {
      const notePath = getNoteFileName(id)
      fs.writeFileSync(notePath, content)
    }

    writeMetadata(metadata)
    return { success: true, note: noteMeta }
  })

  // IPC: 删除笔记
  ipcMain.handle('delete-note', async (event, noteId) => {
    const metadata = readMetadata()
    const index = metadata.notes.findIndex(n => n.id === noteId)
    if (index === -1) return { success: false, error: 'Note not found' }

    // 从 metadata 中移除
    metadata.notes.splice(index, 1)
    writeMetadata(metadata)

    // 删除文件
    const notePath = getNoteFileName(noteId)
    if (fs.existsSync(notePath)) {
      fs.unlinkSync(notePath)
    }

    return { success: true }
  })

  // IPC: 归档/激活笔记
  ipcMain.handle('archive-note', async (event, { id, active }) => {
    const metadata = readMetadata()
    const noteMeta = metadata.notes.find(n => n.id === id)
    if (!noteMeta) return { success: false, error: 'Note not found' }

    noteMeta.active = active ? 1 : 0
    noteMeta.accessed_at = Math.round(Date.now() / 1000)
    writeMetadata(metadata)

    return { success: true, note: noteMeta }
  })

  // IPC: 搜索笔记
  ipcMain.handle('search-notes', async (event, keyword) => {
    const metadata = readMetadata()
    const results = []

    for (const note of metadata.notes) {
      if (note.active !== 1) continue

      const notePath = getNoteFileName(note.id)
      let content = ''
      if (fs.existsSync(notePath)) {
        content = fs.readFileSync(notePath, 'utf-8')
      }

      if (note.title.toLowerCase().includes(keyword.toLowerCase()) ||
          content.toLowerCase().includes(keyword.toLowerCase())) {
        const lines = content.split('\n').filter(line => line.trim())
        const firstLine = lines[0] || ''
        results.push({
          id: note.id,
          title: note.title,
          active: note.active,
          created_at: note.created_at,
          accessed_at: note.accessed_at,
          first_line: firstLine.replace(/^#+\s*/, '').substring(0, 100),
          line_count: content.split('\n').length
        })
      }
    }

    results.sort((a, b) => b.accessed_at - a.accessed_at)
    return results
  })

  // IPC: 获取数据目录路径
  ipcMain.handle('get-data-path', async () => {
    initPaths()
    return DATA_DIR
  })

  // IPC: 打开数据目录
  ipcMain.handle('open-data-folder', async () => {
    initPaths()
    try {
      await shell.openPath(DATA_DIR)
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  })

  // ========== 技能系统 IPC ==========

  // IPC: 获取用户角色
  ipcMain.handle('get-user-role', async () => {
    const metadata = readMetadata()
    return metadata.userRole || null
  })

  // IPC: 设置用户角色
  ipcMain.handle('set-user-role', async (event, role) => {
    const metadata = readMetadata()
    metadata.userRole = role

    // 根据角色设置默认技能
    const roleSkills = {
      'product': ['quickSearch', 'history', 'snippets', 'templates'],
      'sales': ['quickSearch', 'history', 'starred', 'tags', 'dailyTodo'],
      'general': ['quickSearch', 'history']
    }
    metadata.enabledSkills = roleSkills[role] || roleSkills['general']

    writeMetadata(metadata)
    return { success: true, enabledSkills: metadata.enabledSkills }
  })

  // IPC: 获取启用的技能列表
  ipcMain.handle('get-enabled-skills', async () => {
    const metadata = readMetadata()
    return metadata.enabledSkills || ['quickSearch', 'history']
  })

  // IPC: 设置启用的技能
  ipcMain.handle('set-enabled-skills', async (event, skills) => {
    const metadata = readMetadata()
    metadata.enabledSkills = skills
    writeMetadata(metadata)
    return { success: true }
  })

  // ========== 快捷码 IPC ==========

  // IPC: 获取所有快捷码
  ipcMain.handle('get-snippets', async () => {
    initPaths()
    try {
      const data = fs.readFileSync(SNIPPETS_FILE, 'utf-8')
      return JSON.parse(data).snippets || []
    } catch (e) {
      return []
    }
  })

  // IPC: 添加快捷码
  ipcMain.handle('add-snippet', async (event, snippet) => {
    initPaths()
    try {
      const data = JSON.parse(fs.readFileSync(SNIPPETS_FILE, 'utf-8'))
      const newSnippet = {
        id: Date.now(),
        alias: snippet.alias,
        content: snippet.content,
        usageCount: 0,
        createdAt: Math.round(Date.now() / 1000)
      }
      data.snippets.push(newSnippet)
      fs.writeFileSync(SNIPPETS_FILE, JSON.stringify(data, null, 2))
      return { success: true, snippet: newSnippet }
    } catch (e) {
      return { success: false, error: e.message }
    }
  })

  // IPC: 删除快捷码
  ipcMain.handle('delete-snippet', async (event, snippetId) => {
    initPaths()
    try {
      const data = JSON.parse(fs.readFileSync(SNIPPETS_FILE, 'utf-8'))
      data.snippets = data.snippets.filter(s => s.id !== snippetId)
      fs.writeFileSync(SNIPPETS_FILE, JSON.stringify(data, null, 2))
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  })

  // IPC: 更新快捷码
  ipcMain.handle('update-snippet', async (event, snippetId, updates) => {
    initPaths()
    try {
      const data = JSON.parse(fs.readFileSync(SNIPPETS_FILE, 'utf-8'))
      const snippet = data.snippets.find(s => s.id === snippetId)
      if (snippet) {
        Object.assign(snippet, updates)
        fs.writeFileSync(SNIPPETS_FILE, JSON.stringify(data, null, 2))
        return { success: true }
      }
      return { success: false, error: 'Snippet not found' }
    } catch (e) {
      return { success: false, error: e.message }
    }
  })

  // IPC: 增加快捷码使用次数
  ipcMain.handle('increment-snippet-usage', async (event, snippetId) => {
    initPaths()
    try {
      const data = JSON.parse(fs.readFileSync(SNIPPETS_FILE, 'utf-8'))
      const snippet = data.snippets.find(s => s.id === snippetId)
      if (snippet) {
        snippet.usageCount = (snippet.usageCount || 0) + 1
        fs.writeFileSync(SNIPPETS_FILE, JSON.stringify(data, null, 2))
      }
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  })

  // ========== 操作日志 IPC ==========

  // IPC: 添加操作日志
  ipcMain.handle('add-operation-log', async (event, log) => {
    initPaths()
    try {
      const data = JSON.parse(fs.readFileSync(OPERATION_LOGS_FILE, 'utf-8'))
      const newLog = {
        id: Date.now(),
        noteId: log.noteId,
        action: log.action, // 'create', 'update', 'delete'
        snapshot: log.snapshot,
        timestamp: Math.round(Date.now() / 1000)
      }
      data.logs.unshift(newLog) // 新日志在前面
      // 只保留最近100条
      if (data.logs.length > 100) {
        data.logs = data.logs.slice(0, 100)
      }
      fs.writeFileSync(OPERATION_LOGS_FILE, JSON.stringify(data, null, 2))
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  })

  // IPC: 获取操作日志
  ipcMain.handle('get-operation-logs', async (event, noteId) => {
    initPaths()
    try {
      const data = JSON.parse(fs.readFileSync(OPERATION_LOGS_FILE, 'utf-8'))
      let logs = data.logs || []
      // 如果指定了 noteId，只返回该笔记的日志
      if (noteId) {
        logs = logs.filter(l => l.noteId === noteId)
      }
      // 只返回最近7天的日志
      const sevenDaysAgo = Math.round(Date.now() / 1000) - 7 * 24 * 60 * 60
      logs = logs.filter(l => l.timestamp >= sevenDaysAgo)
      return logs
    } catch (e) {
      return []
    }
  })

  // IPC: 回滚到指定版本
  ipcMain.handle('rollback-note', async (event, { noteId, logId }) => {
    initPaths()
    try {
      const logsData = JSON.parse(fs.readFileSync(OPERATION_LOGS_FILE, 'utf-8'))
      const log = logsData.logs.find(l => l.id === logId && l.noteId === noteId)
      if (!log || !log.snapshot) {
        return { success: false, error: '版本不存在' }
      }

      // 恢复笔记内容
      const metadata = readMetadata()
      const noteMeta = metadata.notes.find(n => n.id === noteId)
      if (!noteMeta) {
        return { success: false, error: '笔记不存在' }
      }

      // 写入恢复的内容
      const notePath = getNoteFileName(noteId)
      fs.writeFileSync(notePath, log.snapshot.content || '')

      // 更新标题
      if (log.snapshot.title) {
        noteMeta.title = log.snapshot.title
        writeMetadata(metadata)
      }

      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  })

  // ========== 每日碎片笔记提醒 IPC ==========

  // IPC: 检查碎片笔记
  ipcMain.handle('check-fragment-notes', async () => {
    const metadata = readMetadata()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = Math.round(today.getTime() / 1000)

    let fragmentNotes = []

    for (const note of metadata.notes) {
      if (note.active !== 1) continue

      // 检查是否是今天创建或修改的笔记
      if (note.created_at >= todayTimestamp || note.accessed_at >= todayTimestamp) {
        const notePath = getNoteFileName(note.id)
        if (fs.existsSync(notePath)) {
          const content = fs.readFileSync(notePath, 'utf-8')
          // 检查内容长度是否小于50个字符
          if (content.trim().length > 0 && content.trim().length < 50) {
            fragmentNotes.push({
              id: note.id,
              title: note.title,
              content: content.trim()
            })
          }
        }
      }
    }

    return {
      count: fragmentNotes.length,
      notes: fragmentNotes
    }
  })

  // IPC: 触发每日碎片笔记检查（手动触发或定时触发）
  ipcMain.handle('trigger-daily-review', async () => {
    const result = await ipcMain.emit('check-fragment-notes')
    const fragmentResult = await new Promise((resolve) => {
      ipcMain.handleOnce('check-fragment-notes-internal', async () => {
        const metadata = readMetadata()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTimestamp = Math.round(today.getTime() / 1000)

        let fragmentNotes = []

        for (const note of metadata.notes) {
          if (note.active !== 1) continue

          if (note.created_at >= todayTimestamp || note.accessed_at >= todayTimestamp) {
            const notePath = getNoteFileName(note.id)
            if (fs.existsSync(notePath)) {
              const content = fs.readFileSync(notePath, 'utf-8')
              if (content.trim().length > 0 && content.trim().length < 50) {
                fragmentNotes.push({
                  id: note.id,
                  title: note.title,
                  content: content.trim()
                })
              }
            }
          }
        }

        return {
          count: fragmentNotes.length,
          notes: fragmentNotes
        }
      })

      ipcMain.emit('check-fragment-notes-internal')
      setTimeout(() => {
        resolve({ count: 0, notes: [] })
      }, 100)
    })

    if (fragmentResult.count > 0) {
      // 创建通知
      const notification = new Notification({
        title: '今日笔记梳理',
        body: `您今天记录了 ${fragmentResult.count} 条碎片笔记，点击进行补全。`,
        silent: false
      })

      notification.on('click', () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
          // 发送消息到渲染进程，高亮显示碎片笔记
          mainWindow.webContents.send('show-fragment-notes', {
            count: fragmentResult.count,
            notes: fragmentResult.notes
          })
        }
      })

      notification.show()
    }

    return {
      triggered: true,
      count: fragmentResult.count
    }
  })
}

function createWindow () {
  // 确保数据目录存在
  ensureDataDir()

  // 根据环境确定 preload 路径
  const isDev = process.env.NODE_ENV === 'development'
  const preloadPath = isDev
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, '../build/preload.js')

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      sandbox: false
    }
  })

  mainWindow.setMenu(null)

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000/')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'))
    // 生产模式也允许通过 F12 或 Cmd+Option+I 打开 DevTools
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if ((input.control || input.meta) && input.alt && input.key.toLowerCase() === 'i') {
        mainWindow.webContents.toggleDevTools()
        event.preventDefault()
      }
      if (input.key === 'F12') {
        mainWindow.webContents.toggleDevTools()
        event.preventDefault()
      }
    })
  }

  mainWindow.webContents.on('new-window', function(event, url){
    event.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// 注册全局快捷键
function registerGlobalShortcuts() {
  // 注册 CommandOrControl+. 快捷键
  const ret = globalShortcut.register('CommandOrControl+.', () => {
    if (!mainWindow) return

    if (mainWindow.isVisible() && mainWindow.isFocused()) {
      // 窗口已显示且激活，则隐藏
      mainWindow.hide()
    } else {
      // 窗口隐藏、最小化或未激活，则显示并置顶
      mainWindow.show()
      mainWindow.focus()
      // 通知渲染进程聚焦输入框
      mainWindow.webContents.send('window-shown-via-shortcut')
    }
  })

  if (!ret) {
    console.log('Global shortcut registration failed')
  }
}

// 注销全局快捷键
function unregisterGlobalShortcuts() {
  globalShortcut.unregisterAll()
}

// 等待 Electron 准备好后再注册 IPC handler 和创建窗口
app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()
  registerGlobalShortcuts()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

app.on('will-quit', () => {
  unregisterGlobalShortcuts()
})
