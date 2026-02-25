import React, { Component } from 'react';
import './style.css';
import API from '../../js/api';

const addon = require("./addon.json");

class App extends Component {
  state = {
    text: ""
  }

  componentDidMount(){
    API.event.on("lineFocused", this.lineFocusedAction);
    API.event.on("lineChanged", this.lineChangedAction);
  }

  componentWillUnmount(){
    API.event.removeListener("lineFocused", this.lineFocusedAction);
    API.event.removeListener("lineChanged", this.lineFocusedAction);
  }

  lineFocusedAction = (line) => {
    this.setState({
      text: line.text,
      lineId: line.lineId,
      index: line.index
    });
  }

  lineChangedAction = (text) => {
    this.setState({text});
  }

  renderLinks(text){
    // 改进的 URL 匹配：支持 http(s)://、www.、常见域名
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-zA-Z0-9][-a-zA-Z0-9]*\.(com|cn|net|org|edu|gov|io|co|me|app|dev|tech|ai|xyz|info|biz|tv|cc|top|club|vip|shop|site|online|store|cloud|link|blog|news|video|music|photo|game|social|chat|mail|wiki|forum|space|work|life|world|city|zone|plus|pro|ltd|group|team|studio|design|art|media|agency|solutions|services|network|digital|systems|technology|software|web|mobile|data|center|security|consulting|marketing|finance|legal|health|education|training|institute|academy|school|college|university|research|science|lab|engineering|innovation|future|global|international|asia|europe|africa)[^\s]*)/gi;

    let links = text.match(urlRegex);
    if (!links) return null;

    // 去重
    links = [...new Set(links)];

    return links.map((link, i) => {
      // 标准化链接：如果没有协议，自动添加 https://
      let normalizedLink = link;
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        normalizedLink = 'https://' + link;
      }

      // 提取域名用于显示
      let displayDomain = link;
      try {
        const url = new URL(normalizedLink);
        displayDomain = url.hostname;
      } catch (e) {
        // 如果 URL 解析失败，使用原始链接的第一部分
        displayDomain = link.split('/')[0].replace(/^https?:\/\//, '').replace(/^www\./, '');
      }

      // 判断是否是图片
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'];
      const isImage = imageExtensions.some(ext => link.toLowerCase().endsWith(ext));

      if(isImage){
        return <div className="imageCarrier" key={i}><a href={normalizedLink} target="_blank" rel="noopener noreferrer"><img src={normalizedLink} alt="preview" style={{maxWidth: "100%", maxHeight: "100%"}}/></a></div>
      }else{
        return <a key={i} href={normalizedLink} className="linkCarrier" target="_blank" rel="noopener noreferrer">Link from <b>{displayDomain}</b></a>
      }
    });
  }

  render() {
    if(this.state.text){
      // 改进的 URL 检测：支持多种格式
      const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-zA-Z0-9][-a-zA-Z0-9]*\.(com|cn|net|org|edu|gov|io|co|me|app|dev|tech|ai|xyz|info|biz|tv|cc|top)\b)/i;
      let includes = urlRegex.test(this.state.text);
      if(includes){
        return (
          <>
            <div className="AddonItem">
              <svg className="AddonConfigure" viewBox="0 0 24 24" width="15" height="15" onClick={() => API.event.emit("toggle", "addons")}>
                <path d="M9 4.58V4c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v.58a8 8 0 0 1 1.92 1.11l.5-.29a2 2 0 0 1 2.74.73l1 1.74a2 2 0 0 1-.73 2.73l-.5.29a8.06 8.06 0 0 1 0 2.22l.5.3a2 2 0 0 1 .73 2.72l-1 1.74a2 2 0 0 1-2.73.73l-.5-.3A8 8 0 0 1 15 19.43V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.58a8 8 0 0 1-1.92-1.11l-.5.29a2 2 0 0 1-2.74-.73l-1-1.74a2 2 0 0 1 .73-2.73l.5-.29a8.06 8.06 0 0 1 0-2.22l-.5-.3a2 2 0 0 1-.73-2.72l1-1.74a2 2 0 0 1 2.73-.73l.5.3A8 8 0 0 1 9 4.57zM7.88 7.64l-.54.51-1.77-1.02-1 1.74 1.76 1.01-.17.73a6.02 6.02 0 0 0 0 2.78l.17.73-1.76 1.01 1 1.74 1.77-1.02.54.51a6 6 0 0 0 2.4 1.4l.72.2V20h2v-2.04l.71-.2a6 6 0 0 0 2.41-1.4l.54-.51 1.77 1.02 1-1.74-1.76-1.01.17-.73a6.02 6.02 0 0 0 0-2.78l-.17-.73 1.76-1.01-1-1.74-1.77 1.02-.54-.51a6 6 0 0 0-2.4-1.4l-.72-.2V4h-2v2.04l-.71.2a6 6 0 0 0-2.41 1.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
              </svg>
              <h5>{addon.display}</h5>
              <p>{this.renderLinks(this.state.text)}</p>
            </div>
          </>
        );
      }else{
        return null;
      }
    }else{
      return null;
    }
  }
}

export default App;
