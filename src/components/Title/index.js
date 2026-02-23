import React, { Component } from 'react';
import './style.css';
import AppBar from '../AppBar'
import API from '../../js/api';
import Files from '../../js/files';

class Title extends Component {
  state = {
    text: this.props.children,
    archived: !(this.props.sheet.active === 1),
    archiveProgress: false
  }

  componentDidMount(){
    if(this.state.text === "未命名笔记"){
      setTimeout(() => {
        this.refs._title.focus();
      },10);
    }
  }

  componentWillReceiveProps(newProps){
    if(this.props.shouldFocused !== newProps.shouldFocused && newProps.shouldFocused){
      setTimeout(() => {
        this.refs._title.focus();
      },10);
    }
  }

  handleChange(e){
    if(e){
      this.setState({text: e.target.value});
    }
  }

  handleBlur(e){
    let text = e.target.value;
    if(text !== this.props.sheet.title){
      if(!text){
        text = "未命名笔记";
      }
      document.title = text + " | WayneMemo";
      API.updateTitle(text, this.props.sheet.id);
    }
  }

  handleKeyDown(e){
    let selectionStart = this.refs._title.selectionStart;
    let selectionEnd = this.refs._title.selectionEnd;

    if(e.keyCode === 13 || (selectionStart === selectionStart && e.keyCode === 39 && selectionStart === this.state.text.length) || e.keyCode === 40){
      this.props.onTitleDown();
      e.preventDefault();
      return false;
    }
  }

  exportAction(){
    Files.exportFile(this.props.sheet.id).then(res => {
      console.log("文件导出已开始");
    });
  }

  archiveAction(){
    let currentStatus = this.state.archived;
    let toStatus = currentStatus;
    this.setState({
      archiveProgress: true
    })

    API.archiveUpdate(this.props.sheet.id, toStatus).then(() => {
      setTimeout(() => {
        this.setState({
          archived: !currentStatus,
          archiveProgress: false
        })
      }, 100);
    });
  }

  deleteAction(){
      API.deleteSheet(this.props.sheet.id);
      API.event.emit("sheet", "LAST_ACCESSED");
  }

  render() {
    return (
      <>
        <div className={this.state.archived ? "Title TitleArchived" : "Title"}>
          <input
            ref="_title"
            placeholder={"未命名笔记"}
            value={this.state.text === "未命名笔记" ? "" : this.state.text}
            onKeyDown={(event) => this.handleKeyDown(event)}
            onBlur={(event) => this.handleBlur(event)}
            onChange={(event) => this.handleChange(event)}/>

            <div className="inSheetAction">
              <div className="inSheetButton" onClick={() => this.exportAction()}>
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M11 14.59V3a1 1 0 0 1 2 0v11.59l3.3-3.3a1 1 0 0 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 1.4-1.42l3.3 3.3zM3 17a1 1 0 0 1 2 0v3h14v-3a1 1 0 0 1 2 0v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3z"/></svg>
                <span>导出</span>
              </div>
              <div className={!this.state.archived ? "inSheetButton archivedButton" : "inSheetButton unarchivedButton"} onClick={() => this.archiveAction()}>
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M20 9v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2zm0-2V5H4v2h16zM6 9v10h12V9H6zm4 2h4a1 1 0 0 1 0 2h-4a1 1 0 0 1 0-2z"/></svg>
                {!this.state.archiveProgress && <span>{this.state.archived ? "恢复" : "归档"}</span>}
                {this.state.archiveProgress && <span style={{width: 52, textAlign: "center"}}>&middot; &middot; &middot;</span>}
              </div>
              <div className={!this.state.archived ? "inSheetButton removeButton" : "inSheetButton removeButton removeButtonActive"} onClick={() => this.deleteAction()}>
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm4-8a1 1 0 0 1-1 1H9a1 1 0 0 1 0-2h6a1 1 0 0 1 1 1z"/></svg>
                <span>删除</span>
              </div>
            </div>
        </div>
      </>
    );
  }
}

export default Title;
