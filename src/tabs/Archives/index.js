import React, { Component } from 'react';
import './style.css';
import API from '../../js/api';
import Loading from '../../components/Loading';

class Archives extends Component {
  state = {
    sheets: [],
    noSheets: false
  }

  componentDidMount(){
    API.getSheets(0).then(sheets => {
      if(sheets.length){
        this.setState({sheets});
      }else{
        this.setState({noSheets: true});
      }
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
        return (<div className="tabNotice">您没有归档笔记！</div>);
      }else{
        return (<Loading height={200}/>);
      }
    }
  }

  render() {
    return (
      <div className="TabCarrier ArchivesTab">
        <h4>归档笔记</h4>
        <p className="sub">查看和管理您的归档笔记。</p>
        <div className="tabScroller">
          {this.renderSheets(this.state.sheets)}
        </div>
      </div>
    );
  }
}

export default Archives;
