import React, { Component } from 'react';
import './style.css';
import API from '../../js/api';

class Login extends Component {
  state = {
    loadingText: "正在启动...",
    showRoleSelection: false,
    selectedRole: null
  }

  async componentDidMount() {
    // 检查是否已选择角色
    const userRole = await API.getUserRole();
    if (!userRole) {
      // 首次使用，显示角色选择
      this.setState({ showRoleSelection: true });
    } else {
      // 已有角色，直接进入
      setTimeout(() => {
        API.event.emit("login", true);
      }, 500);
    }
  }

  selectRole = (role) => {
    this.setState({ selectedRole: role });
  }

  confirmRole = async () => {
    const { selectedRole } = this.state;
    if (!selectedRole) return;

    this.setState({ loadingText: "正在配置..." });

    // 设置角色和默认技能
    await API.setUserRole(selectedRole);

    // 进入主界面
    API.event.emit("login", true);
  }

  renderRoleSelection() {
    const { selectedRole } = this.state;

    const roles = [
      {
        id: 'product',
        title: '产研人员',
        icon: '💻',
        description: '产品经理、研发工程师、运营',
        features: ['快捷码', '场景模板', '极速搜索', '历史版本']
      },
      {
        id: 'sales',
        title: '销售人员',
        icon: '🎯',
        description: '销售代表、客户经理、商务',
        features: ['星标置顶', '智能标签', '每日待办', '极速搜索']
      },
      {
        id: 'general',
        title: '通用用户',
        icon: '📝',
        description: '其他场景，保持简洁',
        features: ['极速搜索', '历史版本']
      }
    ];

    return (
      <div className="RoleSelection">
        <div className="roleSelectionContent">
          <h2>欢迎使用 WayneMemo</h2>
          <p className="roleSubtitle">选择您的角色，我们将为您推荐最适合的功能</p>

          <div className="roleCards">
            {roles.map(role => (
              <div
                key={role.id}
                className={`roleCard ${selectedRole === role.id ? 'selected' : ''}`}
                onClick={() => this.selectRole(role.id)}
              >
                <div className="roleIcon">{role.icon}</div>
                <h3>{role.title}</h3>
                <p className="roleDesc">{role.description}</p>
                <div className="roleFeatures">
                  {role.features.map((f, i) => (
                    <span key={i} className="featureTag">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            className="confirmRoleBtn"
            disabled={!selectedRole}
            onClick={this.confirmRole}
          >
            开始使用
          </button>

          <p className="roleHint">稍后可以在设置中修改技能和偏好</p>
        </div>
      </div>
    );
  }

  render() {
    const { showRoleSelection } = this.state;

    if (showRoleSelection) {
      return this.renderRoleSelection();
    }

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
