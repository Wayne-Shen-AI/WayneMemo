import React, { Component } from 'react';
import './style.css';
import API from '../../js/api';

class Login extends Component {
  state = {
    loadingText: "正在启动..."
  }

  componentDidMount() {
    // 自动进入离线模式
    setTimeout(() => {
      API.event.emit("login", true);
    }, 500);
  }

  render() {
    return (
      <div className="Login">
        <div className="loadingIndicator">
          <div className="spinner"></div>
          <p>{this.state.loadingText}</p>
        </div>
      </div>
    );
  }
}

export default Login;
