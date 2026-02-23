import React, { Component } from 'react';
import './style.css';
import API from '../../js/api'

class Cover extends Component {
  state = {
    headText: "拖放文件导入笔记",
    smallText: "仅支持纯文本格式（.txt, .md）"
  }

  componentDidMount(){
    API.event.on("importStarted", fileName => {
      this.setState({
        headText: "正在处理...",
        smallText: "正在处理文件：" + fileName
      })
    })

    API.event.on("importEnded", () => {
      setTimeout(() => {
        this.setState({
          headText: "拖放文件导入笔记",
          smallText: "仅支持纯文本格式（.txt, .md）"
        })
      }, 200);
    })
  }

  render() {
    return (
      <>
        <div id="cover" className="cover">
          <div className="coverInner">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path d="M13 5.41V17a1 1 0 0 1-2 0V5.41l-3.3 3.3a1 1 0 0 1-1.4-1.42l5-5a1 1 0 0 1 1.4 0l5 5a1 1 0 1 1-1.4 1.42L13 5.4zM3 17a1 1 0 0 1 2 0v3h14v-3a1 1 0 0 1 2 0v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3z"/></svg>
            </div>
            <h3>{this.state.headText}</h3>
            <small>{this.state.smallText}</small>
          </div>
        </div>
      </>
    );
  }
}

export default Cover;
