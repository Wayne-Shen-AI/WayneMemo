// Modules to control application life and create native browser window
const {app, BrowserWindow, shell, ipcMain} = require('electron')
const fs = require('fs')
const path = require('path')

// Keep a global reference of the window object
let mainWindow

// 本地数据存储目录
const DATA_DIR = path.join(app.getPath('documents'), 'WayneMemo_Data')
const NOTES_DIR = path.join(DATA_DIR, 'notes')
const METADATA_FILE = path.join(DATA_DIR, 'metadata.json')

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true })
  }
  // 初始化 metadata 文件
  if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify({
      lastId: 0,
      notes: []
    }, null, 2))
  }
}

// 读取元数据
function readMetadata() {
  try {
    const data = fs.readFileSync(METADATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    return { lastId: 0, notes: [] }
  }
}

// 写入元数据
function writeMetadata(metadata) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2))
}

// 生成笔记文件名
function getNoteFileName(id) {
  return path.join(NOTES_DIR, `note-${id}.md`)
}

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
  return DATA_DIR
})

function createWindow () {
  // 确保数据目录存在
  ensureDataDir()

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  mainWindow.setMenu(null)

  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000/')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'))
  }

  mainWindow.webContents.on('new-window', function(event, url){
    event.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
