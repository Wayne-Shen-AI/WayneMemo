import React, { Component } from 'react';
import './style.css';
import API from '../../js/api';

const quoteRand = Math.floor(Math.random() * (4 - 0 + 1) ) + 0;

class Loading extends Component {
  state = {
    spinning: true
  }

  componentDidMount(){
    API.event.on("loginButton", () => {
      this.setState({spinning: false});
    });

    API.event.on("checkingUpdates", () => {
      this.setState({statusText: "正在检查更新..."});
    });

    API.event.on("fetching", () => {
      this.setState({statusText: "正在从 GitHub 获取数据..."});
    });

    API.event.on("fetched", () => {
      this.setState({statusText: ""});
    });
  }

  renderQuote(){
    let quoteArray = [
      {
        person: "穆罕默德·阿里",
        quote: "每天都带着期待迎接挑战，然后全力以赴！"
      },
      {
        person: "李小龙",
        quote: "没有极限，只有平台期，你不能停留在那里，必须超越它。"
      },
      {
        person: "华特·迪士尼",
        quote: "当你相信一件事时，就全心全意地相信它，毫无保留。"
      },
      {
        person: "纳尔逊·曼德拉",
        quote: "凡事在成功之前看起来都像是 impossible。"
      },
      {
        person: "科比·布莱恩特",
        quote: "如果你害怕失败，那你很可能会失败。"
      }
    ];

    let quote = quoteArray[quoteRand];

    return (
      <div className="quote" style={{height: 114}}>
        <p>{quote.quote}</p>
        <div className="hr"></div>
        <span>{quote.person}</span>
      </div>
    );
  }

  render() {
    return (
      <div className="Loading" style={{height: this.props.height}}>
        {this.props.quote && <img src={API.getTheme() == "dark" ? require("../../assets/memo_logo_left_white.png"):require("../../assets/memo_logo_left.png")} style={{marginBottom: 10, width: 159, height: 42}} alt="WayneMemo"/>}
        {this.state.spinning &&
          <>
            <div className="spinner">
              <div className="spinnerHole"></div>
            </div>
          </>
        }
        <div style={{height: this.state.spinning ? 0 : "auto", overflow: "hidden", margin: this.state.spinning ? 0 : 16}}>{this.props.children}</div>
        {this.props.quote && this.renderQuote()}
        {this.state.statusText && <div className="loginStatusText">{this.state.statusText}</div>}
      </div>
    );
  }
}

export default Loading;
