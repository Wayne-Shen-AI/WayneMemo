import React, { Component } from 'react';
import './style.css';
import API from "../../js/api"

class Settings extends Component {
  state = {
    theme: API.getTheme(),
    dataPath: '',
    toggleUserOptions: false
  }

  componentDidMount() {
    // 获取数据目录路径
    if (window.electronAPI) {
      window.electronAPI.getDataPath().then(path => {
        this.setState({ dataPath: path });
      });
    }
  }

  handleOpenDataFolder = async () => {
    if (window.electronAPI && window.electronAPI.openDataFolder) {
      const result = await window.electronAPI.openDataFolder();
      if (!result.success) {
        alert('无法打开文件夹：' + result.error);
      }
    }
  }

  changeTheme(changeTo) {
    this.setState({ theme: changeTo })
    API.event.emit("theme", changeTo);
    API.updatePreference("theme", changeTo);
  }

  render() {
    return (
      <div className="TabCarrier SettingsTab">
        <h4>设置</h4>
        <p className="sub">管理您的偏好设置和账户信息。</p>

        <h5>选择主题</h5>
        <div className="prefItem theme">
          <div onClick={() => this.changeTheme("dark")} className={this.state.theme === "dark" ? "darkTheme themeActive" : "darkTheme"}>
            <div className="themeScreen">
              <img src={require("../../assets/memo_logo_left_white.png")} alt="dark theme"/>
              <div className="themeScreenElement"></div>
            </div>
          </div>
          <div onClick={() => this.changeTheme("light")} className={this.state.theme === "light" ? "lightTheme themeActive" : "lightTheme"}>
            <div className="themeScreen">
              <img src={require("../../assets/memo_logo_left.png")} alt="light theme"/>
              <div className="themeScreenElement"></div>
            </div>
          </div>
        </div>

        <h5>数据存储位置</h5>
        <p className="sub">您的笔记数据保存在以下位置：</p>
        <div className="label" style={{ fontSize: 13, wordBreak: 'break-all', cursor: 'pointer', color: '#0066cc' }}
             onClick={this.handleOpenDataFolder}
             title="点击打开文件夹">
          {this.state.dataPath || 'WayneMemo_Data (文档目录下)'}
        </div>
        <p className="sub" style={{ fontSize: 11, marginTop: 5 }}>点击路径可在文件管理器中打开</p>

        <h5>快捷键</h5>
        <div className="shortcutsList">
          <div className="shortcutItem">
            <kbd>Cmd/Ctrl + F</kbd>
            <span>搜索笔记内容</span>
          </div>
          <div className="shortcutItem">
            <kbd>Cmd/Ctrl + S</kbd>
            <span>打开笔记列表</span>
          </div>
          <div className="shortcutItem">
            <kbd>Cmd/Ctrl + U</kbd>
            <span>查看归档笔记</span>
          </div>
          <div className="shortcutItem">
            <kbd>Cmd/Ctrl + E</kbd>
            <span>插件管理</span>
          </div>
          <div className="shortcutItem">
            <kbd>Cmd/Ctrl + Shift + H</kbd>
            <span>操作历史/撤销</span>
          </div>
          <div className="shortcutItem">
            <kbd>Cmd/Ctrl + ,</kbd>
            <span>设置</span>
          </div>
          <div className="shortcutItem">
            <kbd>Esc</kbd>
            <span>关闭侧边栏</span>
          </div>
          <div className="shortcutItem">
            <kbd>Cmd/Ctrl + .</kbd>
            <span>全局快捷键：显示/隐藏窗口</span>
          </div>
          <div className="shortcutItem">
            <kbd>/</kbd>
            <span>触发快捷码(Snippets)</span>
          </div>
        </div>

        <h5>关于 WayneMemo</h5>
        <p className="sub">基于开源项目 Memo 开发的纯本地离线版本。</p>
        <p className="version">WayneMemo v{API.version}</p>

        <div className="myaccount">
          <p className="sub" style={{ paddingLeft: 5 }}>
            <span>您正在使用本地离线模式。</span>
            <br/>
            <span className="userHandle">
              所有数据存储在本地，无需网络连接。
            </span>
          </p>
        </div>
      </div>
    );
  }
}

export default Settings;
