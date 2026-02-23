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
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.invoke('get-data-path').then(path => {
        this.setState({ dataPath: path });
      });
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
        <div className="label" style={{ fontSize: 13, wordBreak: 'break-all' }}>
          {this.state.dataPath || 'WayneMemo_Data (文档目录下)'}
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
