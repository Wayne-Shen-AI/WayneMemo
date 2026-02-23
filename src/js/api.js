import Event from './event';
import makeid from './makeid';

const VERSION = "1.0.0";
const DEVELOPMENT = false;

// 检测是否在 Electron 环境
const isElectron = () => {
  return window && window.process && window.process.type;
};

// 获取 ipcRenderer（仅在 Electron 中可用）
let ipcRenderer = null;
if (isElectron()) {
  const { ipcRenderer: ipc } = window.require('electron');
  ipcRenderer = ipc;
}

class API {
  constructor() {
    this.event = Event;
    this.version = VERSION;
    this.development = DEVELOPMENT;
    this.logged = true; // 本地版默认已登录
    this.theme = this.getData("theme") || "light";
    this.currentSheet = null;

    console.log("API: init - Local Mode");

    // 自动初始化
    this.init();
  }

  async init() {
    if (isElectron()) {
      // 确保有默认笔记
      const notes = await this.getSheets(1);
      if (notes.length === 0) {
        // 创建欢迎笔记
        await this.createWelcomeNote();
      }
      this.event.emit("login", true);
      this.event.emit("sheet", "LAST_ACCESSED");
    }
  }

  // 创建欢迎笔记
  async createWelcomeNote() {
    const welcomeContent = `# 欢迎使用 WayneMemo

这是一个完全离线的笔记应用。

## 特点

- 📝 纯本地存储，数据完全由您掌控
- 🔒 无需登录，无需网络连接
- 📁 数据保存在文档目录下的 WayneMemo_Data 文件夹
- 💾 自动保存，无需手动同步

## 快捷键

- Ctrl/Cmd + S - 打开笔记列表
- Ctrl/Cmd + F - 搜索笔记
- Ctrl/Cmd + , - 设置
- Esc - 关闭侧边栏

开始记录您的想法吧！
`;

    const note = await ipcRenderer.invoke('create-note', '欢迎使用 WayneMemo');
    await ipcRenderer.invoke('update-note', {
      id: note.id,
      content: welcomeContent
    });
  }

  isOnline() {
    return false; // 本地版始终返回离线
  }

  // 获取单条笔记
  async getSheet(sheetId) {
    if (!isElectron()) {
      return this.getMockSheet(sheetId);
    }

    // 创建新笔记
    if (sheetId === "NEW_SHEET") {
      const newNote = await ipcRenderer.invoke('create-note', 'Untitled Sheet');
      return {
        id: newNote.id,
        title: newNote.title,
        active: 1,
        lines: []
      };
    }

    // 获取最近访问的笔记
    if (sheetId === "LAST_ACCESSED") {
      const notes = await ipcRenderer.invoke('get-notes-list');
      if (notes.length > 0) {
        const note = await ipcRenderer.invoke('get-note', notes[0].id);
        this.currentSheet = note;
        return note;
      } else {
        // 没有笔记时创建新笔记
        const newNote = await ipcRenderer.invoke('create-note', 'Untitled Sheet');
        return {
          id: newNote.id,
          title: newNote.title,
          active: 1,
          lines: []
        };
      }
    }

    // 获取指定笔记
    const note = await ipcRenderer.invoke('get-note', parseInt(sheetId));
    this.currentSheet = note;
    return note || "removed";
  }

  // 获取笔记列表
  async getSheets(active, count = false) {
    if (!isElectron()) {
      return [];
    }

    if (active === 1) {
      const notes = await ipcRenderer.invoke('get-notes-list');
      if (count) {
        return notes.length;
      }
      return notes;
    } else {
      const notes = await ipcRenderer.invoke('get-archived-notes');
      if (count) {
        return notes.length;
      }
      return notes;
    }
  }

  // 搜索笔记
  async searchSheets(term) {
    if (!isElectron()) {
      return [];
    }
    return await ipcRenderer.invoke('search-notes', term);
  }

  // 更新行（段落）
  async updateLine(id, pos, text, action, hint) {
    if (!isElectron() || !this.currentSheet) return;

    const sheetId = this.currentSheet.id;

    // 获取当前笔记内容
    const note = await ipcRenderer.invoke('get-note', sheetId);
    if (!note) return;

    let lines = note.lines;

    if (action === "rm") {
      // 删除行
      lines = lines.filter(line => line.pos !== pos);
      // 重新排序
      lines.forEach((line, idx) => { line.pos = idx; });
    } else {
      // 更新或插入行
      const existingIndex = lines.findIndex(line => line.pos === pos);
      if (existingIndex >= 0) {
        lines[existingIndex].text = text;
      } else {
        // 插入新行
        lines.push({
          line_key: makeid(5),
          date: new Date().toLocaleDateString(),
          text: text,
          pos: pos
        });
      }
    }

    // 将 lines 转换为 markdown 内容
    const content = lines.map(line => line.text).join('\n');
    await ipcRenderer.invoke('update-note', {
      id: sheetId,
      content: content
    });
  }

  // 更新标题
  async updateTitle(text, sheetId) {
    if (!isElectron()) return;
    await ipcRenderer.invoke('update-note', {
      id: sheetId,
      title: text
    });
  }

  // 归档/激活笔记
  async archiveUpdate(sheetId, toStatus) {
    if (!isElectron()) return;
    await ipcRenderer.invoke('archive-note', {
      id: sheetId,
      active: toStatus
    });
  }

  // 删除笔记
  async deleteSheet(sheetId) {
    if (!isElectron()) return;
    await ipcRenderer.invoke('delete-note', sheetId);
  }

  // 获取主题
  getTheme() {
    return this.getData("theme") || "light";
  }

  // 更新偏好设置
  updatePreference(pref, to) {
    this.setData(pref, to);
    console.log(pref + ": ", to);
  }

  // localStorage 封装
  setData(key, data) {
    return localStorage.setItem(key, data);
  }

  getData(key) {
    return localStorage.getItem(key);
  }

  // Mock 数据（用于非 Electron 环境测试）
  getMockSheet(sheetId) {
    if (sheetId === "NEW_SHEET") {
      return {
        id: Date.now(),
        title: "Untitled Sheet",
        active: 1,
        lines: [{
          line_key: makeid(5),
          date: new Date().toLocaleDateString(),
          text: "",
          pos: 0
        }]
      };
    }
    return {
      id: 1,
      title: "Mock Note",
      active: 1,
      lines: [{
        line_key: makeid(5),
        date: new Date().toLocaleDateString(),
        text: "This is a mock note for testing",
        pos: 0
      }]
    };
  }

  // 废弃的 GitHub 相关方法（保留空实现以兼容旧代码）
  githubLogin() {
    console.log("GitHub login disabled in local mode");
  }

  githubLogout() {
    console.log("GitHub logout disabled in local mode");
  }

  sync() {
    console.log("Sync disabled in local mode");
    return Promise.resolve({ status: 200 });
  }

  fetch() {
    console.log("Fetch disabled in local mode");
    return Promise.resolve(true);
  }

  setGistId(gistId) {
    console.log("Gist ID setting disabled in local mode");
    return Promise.resolve({});
  }

  addToStaging(sheetId) {
    // 本地模式不需要 staging
  }

  truncateDb() {
    // 本地模式不提供此功能
    console.log("Truncate disabled in local mode");
    return Promise.resolve({});
  }

  getConversions() {
    return fetch("https://api.exchangeratesapi.io/latest?base=USD")
      .then(res => res.json())
      .catch(() => ({ rates: { CNY: 7.2, USD: 1, EUR: 0.85 } }));
  }
}

const _api = new API();
export default _api;
