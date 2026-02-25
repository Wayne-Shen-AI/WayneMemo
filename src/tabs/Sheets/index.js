import React, { Component } from 'react';
import './style.css';
import API from '../../js/api';
import Loading from '../../components/Loading';

class Sheets extends Component {
  state = {
    sheets: [],
    noSheets: false,
    archivedSheetCount: 0
  }

  componentDidMount(){
    this.loadSheets();

    // 监听刷新事件
    API.event.on('refreshSheets', () => {
      this.loadSheets();
    });
  }

  loadSheets = () => {
    API.getSheets(1).then(sheets => {
      if(sheets.length){
        this.setState({sheets, noSheets: false});
      }else{
        this.setState({sheets: [], noSheets: true});
      }
    });

    API.getSheets(0, true).then(sheetCount => {
      this.setState({archivedSheetCount: sheetCount});
    });
  }

  renderSheets(sheets){
    if(sheets.length){
      return sheets.map(sheet => {
        let date = new Date(sheet.created_at * 1000);
        return (
          <div
            className="sheetItem"
            key={sheet.id}
            onClick={() => API.event.emit("sheet", sheet.id)}>
            <div className="sheetRight">
              <span>{sheet.title}</span>
              <div className="sub">{sheet.first_line ? sheet.first_line.substr(0, 50).replace(/-/g, "") + "..." : "这是一个空笔记..."}</div>

              <div className="subHolder">
                <sub>{date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate()}</sub>
                {sheet.first_line &&
                  <sub>{sheet.line_count} 行</sub>
                }
                {!sheet.first_line &&
                  <sub>空白</sub>
                }
              </div>
            </div>
          </div>
        );
      });
    }else{
      if(this.state.noSheets){
        return (<div className="tabNotice" style={{marginBottom: 10}}>您没有活动笔记，创建一个新笔记或查看归档！</div>);
      }else{
        return (<Loading height={200}/>);
      }
    }
  }

  render() {
    return (
      <div className="TabCarrier SheetsTab">
        <h4>笔记列表</h4>
        <p className="sub">查看和管理您最近访问的笔记。</p>
        <div className="tabScroller">
          <div
            className="sheetItem addNew"
            key={"new_sheet"}
            onClick={() => API.event.emit("sheet", "NEW_SHEET")}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="#444" viewBox="0 0 24 24" width="18" height="18"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-9h2a1 1 0 0 1 0 2h-2v2a1 1 0 0 1-2 0v-2H9a1 1 0 0 1 0-2h2V9a1 1 0 0 1 2 0v2z"/></svg>
              <span>创建新笔记</span>
          </div>
          {this.renderSheets(this.state.sheets)}
          {this.state.archivedSheetCount !== 0 &&
            <div
              className="sheetItem"
              key={"archived_sheets"}
              style={{justifyContent: "center"}}
              onClick={() => API.event.emit("toggle", "archives")}>
              <div className="sub" style={{opacity: 0.9}}>您还有 <span style={{fontWeight: 500}}>{this.state.archivedSheetCount} 个归档</span> 笔记。</div>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default Sheets;
