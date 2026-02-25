const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 给前端
contextBridge.exposeInMainWorld('electronAPI', {
  // 笔记相关 API
  getNotesList: () => ipcRenderer.invoke('get-notes-list'),
  getArchivedNotes: () => ipcRenderer.invoke('get-archived-notes'),
  getNote: (noteId) => ipcRenderer.invoke('get-note', noteId),
  createNote: (title) => ipcRenderer.invoke('create-note', title),
  updateNote: (data) => ipcRenderer.invoke('update-note', data),
  deleteNote: (noteId) => ipcRenderer.invoke('delete-note', noteId),
  archiveNote: (data) => ipcRenderer.invoke('archive-note', data),
  searchNotes: (keyword) => ipcRenderer.invoke('search-notes', keyword),
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  openDataFolder: () => ipcRenderer.invoke('open-data-folder'),

  // 技能系统 API
  getUserRole: () => ipcRenderer.invoke('get-user-role'),
  setUserRole: (role) => ipcRenderer.invoke('set-user-role', role),
  getEnabledSkills: () => ipcRenderer.invoke('get-enabled-skills'),
  setEnabledSkills: (skills) => ipcRenderer.invoke('set-enabled-skills', skills),

  // 快捷码 API
  getSnippets: () => ipcRenderer.invoke('get-snippets'),
  addSnippet: (snippet) => ipcRenderer.invoke('add-snippet', snippet),
  deleteSnippet: (snippetId) => ipcRenderer.invoke('delete-snippet', snippetId),
  incrementSnippetUsage: (snippetId) => ipcRenderer.invoke('increment-snippet-usage', snippetId),

  // 操作日志 API
  addOperationLog: (log) => ipcRenderer.invoke('add-operation-log', log),
  getOperationLogs: (noteId) => ipcRenderer.invoke('get-operation-logs', noteId),
  rollbackNote: (noteId, logId) => ipcRenderer.invoke('rollback-note', { noteId, logId }),

  // 全局快捷键 API
  onWindowShownViaShortcut: (callback) => ipcRenderer.on('window-shown-via-shortcut', callback),

  // 每日碎片笔记提醒 API
  checkFragmentNotes: () => ipcRenderer.invoke('check-fragment-notes'),
  triggerDailyReview: () => ipcRenderer.invoke('trigger-daily-review'),
  onShowFragmentNotes: (callback) => ipcRenderer.on('show-fragment-notes', callback)
})
