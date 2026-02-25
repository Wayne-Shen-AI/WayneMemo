import React, { Component } from 'react';
import './App.css';

import Line from './components/Line';
import Title from './components/Title';
import Toolbar from './components/Toolbar';
import Handy from './components/Handy';
import Loading from './components/Loading';
import Cover from './components/Cover';
import AppBar from './components/AppBar';
import Login from './components/Login';

// 技能组件
import QuickSearch from './skills/QuickSearch';

import makeid from './js/makeid';

import API from './js/api';

class App extends Component {

  state = {
    lines: "",
    focusIndex: null,
    cursorPosition: 0,
    logged: false,
    forceLogout: false,
    theme: API.getData("theme") || "light",
    enabledSkills: ['quickSearch', 'history'], // 默认技能
    isCompactMode: false, // 便签模式（窗口缩小时自动启用）
    windowWidth: 1200,
    windowHeight: 800,
    showFragmentFilter: false, // 是否显示碎片笔记过滤视图
    fragmentNotesData: null // 碎片笔记数据
  };

  constructor(props) {
    super(props);
    this.lastLogTime = 0;
    this.lastLogContent = '';
    this.resizeTimeout = null; // 用于防抖
  }

  componentDidMount(){

    window.addEventListener("keydown", (e) => {
      if (e.keyCode === 114 || ((e.ctrlKey || e.metaKey) && e.keyCode === 70)) {
        API.event.emit("toggle", "search");
        e.preventDefault();
      }else if ((e.ctrlKey || e.metaKey) && e.keyCode === 188) {
        API.event.emit("toggle", "settings");
        e.preventDefault();
      }else if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
        API.event.emit("toggle", "sheets");
        e.preventDefault();
      }else if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
        API.event.emit("toggle", "archives");
        e.preventDefault();
      }else if ((e.ctrlKey || e.metaKey) && e.keyCode === 69) {
        API.event.emit("toggle", "addons");
        e.preventDefault();
      }else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 72) {
        API.event.emit("toggle", "history");
        e.preventDefault();
      }else if(e.keyCode === 27){
        API.event.emit("toggle", false);
        e.preventDefault();
      }
    })

    API.event.on("login", async (status) => {
      this.setState({logged: status, forceLogout: (status === false)});

      // 加载用户启用的技能
      if (status) {
        const skills = await API.getEnabledSkills();
        this.setState({ enabledSkills: skills });
      }
    })

    API.event.on("theme", (newTheme) => {
      if(this.state.theme != newTheme){
        this.setState({theme: newTheme});
        API.updatePreference("theme", newTheme);
      }
    })

    API.event.on("sheet", (id) => {
      this.setState({sheetLoading: true, focusIndex: null});
      API.getSheet(id).then((sheet) => {
        if(sheet == "NO_AUTH"){
          console.log("NO_AUTH, retrying initiation");
          API.login("refresh", id);
        }else{
          document.title = sheet.title + " | Memo";
          this.setState({
            lines: sheet.lines,
            sheet: {
              id: sheet.id,
              title: sheet.title,
              active: sheet.active
            }
          });

          this.refs._textScroller.scrollTop = 0;
          setTimeout(() => {
            this.setState({
              sheetLoading: false
            });
          }, 50)
        }
      });
      API.event.emit("toggle", false);
    })

    // 监听窗口大小变化，自动切换便签模式
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    // 监听全局快捷键唤醒事件，聚焦第一个输入框
    if (window.electronAPI && window.electronAPI.onWindowShownViaShortcut) {
      window.electronAPI.onWindowShownViaShortcut(() => {
        // 查找第一个可见的输入框或文本域
        setTimeout(() => {
          const input = document.querySelector('input:not([type="hidden"]), textarea');
          if (input) {
            input.focus();
          }
        }, 100);
      });
    }

    // 监听碎片笔记通知点击事件
    if (window.electronAPI && window.electronAPI.onShowFragmentNotes) {
      window.electronAPI.onShowFragmentNotes((event, data) => {
        console.log('收到碎片笔记通知:', data);
        // 设置一个标记，表示当前正在显示碎片笔记过滤视图
        this.setState({
          showFragmentFilter: true,
          fragmentNotesData: data
        });

        // 聚焦到第一个输入框
        setTimeout(() => {
          const input = document.querySelector('input:not([type="hidden"]), textarea');
          if (input) {
            input.focus();
          }
        }, 100);
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  handleResize = () => {
    // 清除之前的定时器
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // 使用防抖优化性能，但保持响应速度
    this.resizeTimeout = setTimeout(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // 当窗口宽度小于500或高度小于700时，进入便签模式
      const isCompactMode = width < 500 || height < 700;

      // 强制更新状态，确保UI重新渲染
      this.setState({
        windowWidth: width,
        windowHeight: height,
        isCompactMode
      }, () => {
        // 状态更新后的回调，用于调试
        console.log(`窗口尺寸: ${width}x${height}, 便签模式: ${isCompactMode ? '开启' : '关闭'}`);
      });
    }, 100); // 100ms 防抖延迟，保证流畅性
  }

  async logOperation(action) {
    if (!this.state.sheet) return;

    // 防抖机制：5秒内不重复记录相同内容的操作
    const now = Date.now();
    const content = this.state.lines.map(l => l.text).join('\n');

    if (now - this.lastLogTime < 5000 && content === this.lastLogContent) {
      return; // 跳过重复记录
    }

    this.lastLogTime = now;
    this.lastLogContent = content;

    const snapshot = {
      title: this.state.sheet.title,
      content: content
    };

    await API.addOperationLog({
      noteId: this.state.sheet.id,
      action: action,
      snapshot: snapshot
    });
  }

  getDateIdentifier(date){
    let today = new Date();
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    today = String(today.getDate()).padStart(2, '0') + "/" + String(today.getMonth() + 1).padStart(2, '0') + "/" + today.getFullYear();
    yesterday = String(yesterday.getDate()).padStart(2, '0') + "/" + String(yesterday.getMonth() + 1).padStart(2, '0') + "/" + yesterday.getFullYear();

    if(date == today) {
      return "&middot; 今天";
    }else if(date == yesterday){
      return "&middot; 昨天"
    }else{
      return "";
    }
  }

  handleConcat(id, text, i, from){
    let lines = this.state.lines;
    let cursorPosition = 0;

    if((lines.length == i + 1) && from == "down"){
      return null;
    }

    // 记录操作日志
    this.logOperation('concat');

    let lineIndex = from == "up" ? i-1 : i+1;
    let focusIndex = from == "up" ? i-1 : i;
    if(lines[lineIndex]){
      API.updateLine(id, i, "", "rm");
      cursorPosition = lines[focusIndex].text.length;

      if(from == "up"){
        lines[lineIndex].text = lines[lineIndex].text + text;
      }else if(from == "down"){
        lines[lineIndex].text = text + lines[lineIndex].text;
      }
      lines[lineIndex].old_key = lines[lineIndex].line_key;
      lines[lineIndex].line_key = makeid(5);
    }
    lines.splice(i, 1);
    this.setState({focusIndex, cursorPosition, lines});
  }

  handleSplit(id, text, i){
    let keyToSplit = id.split("-")[1];
    let lines = this.state.lines;
    let date = id.split("-")[0].split("!")[1];

    // 记录操作日志
    this.logOperation('split');

    if(lines.length == i+1){
      let today = new Date();
      today = String(today.getDate()).padStart(2, '0') + "/" + String(today.getMonth() + 1).padStart(2, '0') + "/" + today.getFullYear();
      date = today
    }

    let newLineKey = makeid(5);
    lines.splice(i+1, 0, {
      "line_key": newLineKey,
      date,
      text
    });
    this.setState({focusIndex: i+1, cursorPosition: 0, lines});
    API.updateLine(id.split("!")[0]+"!"+date+"-"+newLineKey, i+1, text);
  }

  async handlePaste(id, textArray, index, downText){
    let keyToSplit = id.split("-")[1];
    let lines = this.state.lines;
    let date = id.split("-")[0].split("!")[1];
    let cursorPosition = "end";

    // 记录操作日志
    this.logOperation('paste');

    for (var i = 0; i < textArray.length; i++) {
      let text = textArray[i].replace(/^\s+|\s+$/g, "");
      if(downText){
        if(i == textArray.length - 1){
          cursorPosition = text.length;
          text = text + downText;
        }
      }
      let newLineKey = makeid(5);
      index = index + 1;
      lines.splice(index+1, 0, {
        "line_key": newLineKey,
        date,
        text
      });

      await API.updateLine(id.split("!")[0]+"!"+date+"-"+newLineKey, index, text);
    }
    this.setState({focusIndex: index, cursorPosition, lines});
  }

  handleCursor(direction, id, i){
    let newIndex = 0;
    let cursorPosition = 0;
    if(direction == 37 || direction == 38){
      newIndex = i-1;
    }else if(direction == 39 || direction == 40){
      newIndex = i+1;
    }

    if(direction == 37 || ((direction == 40 || direction == 38) && false)){
      cursorPosition = "end";
    }

    if(i == 0 && (direction == 37 || direction == 38)){
      newIndex = "title";
    }

    this.setState({focusIndex: newIndex, cursorPosition});
  }

  handleBlur(text, lineId, i){
    let lines = this.state.lines;

    if(lines[i].text != text || lines[i].old_key){
      // 记录操作日志
      this.logOperation('update');

      if(lines[i].old_key){
        API.updateLine(lineId, i, text, "key", lines[i].old_key);
        lines[i].old_key = "";
      }else{
        API.updateLine(lineId, i, text);
      }
      lines[i].text = text;
      this.setState({lines, focusIndex: null});
    }
  }

  handleTitleDown(){
    this.setState({focusIndex: 0, cursorPosition: 0});
  }

  focusLast(){
    this.setState({focusIndex: this.state.lines.length - 1, cursorPosition: "end"});
  }

  renderLines(lines){
    let lineArray = [];
    let prevDate = "";

    lines.forEach((l, i) => {
      if(prevDate !== l.date){
        lineArray.push(
          <div
            className="Identifier"
            key={this.state.sheet.id + "-" + l.date}
            onClick={() => this.setState({focusIndex: i})}
            dangerouslySetInnerHTML={{__html: `${l.date} ${this.getDateIdentifier(l.date)}`}}>
          </div>
        );
        prevDate = l.date;
      }

      lineArray.push(
        <Line
          key={this.state.sheet.id + "!" + l.date + "-" + l.line_key}
          id={this.state.sheet.id + "!" + l.date + "-" + l.line_key}
          index={i}
          prevId={lines[i - 1]? this.state.sheet.id + "!" + l.date + "-" + lines[i - 1].line_key : ""}
          nextId={lines[i + 1]? this.state.sheet.id + "!" + l.date + "-" + lines[i + 1].line_key : ""}
          onConcat={this.handleConcat.bind(this)}
          onSplit={this.handleSplit.bind(this)}
          onPaste={this.handlePaste.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          onCursor={this.handleCursor.bind(this)}
          cursorPosition={i == this.state.focusIndex ? this.state.cursorPosition : false}
          focusOnRender={i == this.state.focusIndex}>
          {l.text}
        </Line>
      );
    });

    return lineArray;
  }

  renderApp(){
    const { isCompactMode, showFragmentFilter } = this.state;

    if(this.state.logged){
      return(
        <div className="AppHolder" data-filter={showFragmentFilter ? 'fragments' : ''}>
          <div className={`Note${isCompactMode ? ' compact-mode' : ''}`} key={this.state.logged}>
            <AppBar spacer={true}/>
            <div className={`${this.state.sheetLoading ? "Content" : "Content ContentLoaded"}${isCompactMode ? ' compact-mode' : ''}`} ref="_textScroller" id="content">
              {this.state.sheet &&
                <Title
                  shouldFocused={this.state.focusIndex == "title"}
                  key={this.state.sheet.id}
                  onTitleDown={this.handleTitleDown.bind(this)}
                  sheet={this.state.sheet}>
                  {this.state.sheet.title}
                </Title>
              }
              {this.state.sheet && this.renderLines(this.state.lines)}
              <Handy/>
              <div className="spacer" onClick={() => this.focusLast()}></div>
              <div id="dummy">
                <textarea id="dummyTextarea"></textarea>
              </div>
            </div>
            {!isCompactMode && <Toolbar sheet={this.state.sheet}/>}
          </div>
        </div>
      );
    }else{
      return (
        <div>
          <Loading quote={true}>
            <Login forceLogout={this.state.forceLogout}/>
          </Loading>
        </div>
      );
    }
  }

  render() {
    const { enabledSkills, logged, isCompactMode, windowWidth, windowHeight } = this.state;

    return (
      <div className={`App${this.state.theme == "dark" ? " darkmode": ""}${(window.navigator.platform.includes('Win') || window.navigator.platform.includes('Linux')) ? " win" : ""}`}>
        {this.renderApp()}
        <Cover/>
        <AppBar theme={this.state.theme}/>

        {/* 技能组件 */}
        {logged && enabledSkills.includes('quickSearch') && <QuickSearch/>}
      </div>
    );
  }
}

export default App;
