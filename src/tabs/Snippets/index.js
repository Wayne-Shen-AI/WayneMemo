import React, { Component } from 'react';
import './style.css';
import API from '../../js/api';

class Snippets extends Component {
  state = {
    snippets: [],
    showAddForm: false,
    newSnippet: {
      alias: '',
      content: '',
      description: ''
    },
    editingId: null,
    editSnippet: {
      alias: '',
      content: '',
      description: ''
    }
  }

  componentDidMount() {
    this.loadSnippets();
  }

  loadSnippets = async () => {
    const snippets = await API.getSnippets();
    // 按使用次数排序
    const sorted = snippets.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    this.setState({ snippets: sorted });
  }

  handleAddSnippet = async () => {
    const { newSnippet } = this.state;

    if (!newSnippet.alias.trim() || !newSnippet.content.trim()) {
      return;
    }

    await API.addSnippet({
      alias: newSnippet.alias,
      content: newSnippet.content,
      description: newSnippet.description
    });

    this.setState({
      showAddForm: false,
      newSnippet: { alias: '', content: '', description: '' }
    });

    this.loadSnippets();
  }

  handleDeleteSnippet = async (snippetId) => {
    if (!window.confirm('确定要删除这个快捷码吗？')) {
      return;
    }

    await API.deleteSnippet(snippetId);
    this.loadSnippets();
  }

  startEditSnippet = (snippet) => {
    this.setState({
      editingId: snippet.id,
      editSnippet: {
        alias: snippet.alias,
        content: snippet.content,
        description: snippet.description || ''
      }
    });
  }

  handleUpdateSnippet = async () => {
    const { editingId, editSnippet } = this.state;

    if (!editSnippet.alias.trim() || !editSnippet.content.trim()) {
      return;
    }

    await API.updateSnippet(editingId, {
      alias: editSnippet.alias,
      content: editSnippet.content,
      description: editSnippet.description
    });

    this.setState({
      editingId: null,
      editSnippet: { alias: '', content: '', description: '' }
    });

    this.loadSnippets();
  }

  cancelEdit = () => {
    this.setState({
      editingId: null,
      editSnippet: { alias: '', content: '', description: '' }
    });
  }

  renderAddForm() {
    const { newSnippet } = this.state;

    return (
      <div className="snippetForm">
        <h6>新建快捷码</h6>
        <div className="formGroup">
          <label>别名（输入 /别名 触发）</label>
          <input
            type="text"
            value={newSnippet.alias}
            onChange={(e) => this.setState({
              newSnippet: { ...newSnippet, alias: e.target.value }
            })}
            placeholder="例如：待办、会议"
          />
        </div>
        <div className="formGroup">
          <label>描述（可选）</label>
          <input
            type="text"
            value={newSnippet.description}
            onChange={(e) => this.setState({
              newSnippet: { ...newSnippet, description: e.target.value }
            })}
            placeholder="简短描述这个快捷码的用途"
          />
        </div>
        <div className="formGroup">
          <label>内容</label>
          <textarea
            value={newSnippet.content}
            onChange={(e) => this.setState({
              newSnippet: { ...newSnippet, content: e.target.value }
            })}
            placeholder="输入快捷码展开后的内容..."
            rows={4}
          />
        </div>
        <div className="formActions">
          <button className="btnPrimary" onClick={this.handleAddSnippet}>保存</button>
          <button className="btnSecondary" onClick={() => this.setState({ showAddForm: false })}>取消</button>
        </div>
      </div>
    );
  }

  renderEditForm() {
    const { editSnippet } = this.state;

    return (
      <div className="snippetForm">
        <h6>编辑快捷码</h6>
        <div className="formGroup">
          <label>别名（输入 /别名 触发）</label>
          <input
            type="text"
            value={editSnippet.alias}
            onChange={(e) => this.setState({
              editSnippet: { ...editSnippet, alias: e.target.value }
            })}
            placeholder="例如：待办、会议"
          />
        </div>
        <div className="formGroup">
          <label>描述（可选）</label>
          <input
            type="text"
            value={editSnippet.description}
            onChange={(e) => this.setState({
              editSnippet: { ...editSnippet, description: e.target.value }
            })}
            placeholder="简短描述这个快捷码的用途"
          />
        </div>
        <div className="formGroup">
          <label>内容</label>
          <textarea
            value={editSnippet.content}
            onChange={(e) => this.setState({
              editSnippet: { ...editSnippet, content: e.target.value }
            })}
            placeholder="输入快捷码展开后的内容..."
            rows={4}
          />
        </div>
        <div className="formActions">
          <button className="btnPrimary" onClick={this.handleUpdateSnippet}>保存</button>
          <button className="btnSecondary" onClick={this.cancelEdit}>取消</button>
        </div>
      </div>
    );
  }

  renderSnippetList() {
    const { snippets, editingId } = this.state;

    if (snippets.length === 0) {
      return (
        <div className="snippetEmpty">
          <p>还没有快捷码</p>
          <p className="sub">点击上方按钮创建，或在编辑器中输入 / 查看默认快捷码</p>
        </div>
      );
    }

    return (
      <div className="snippetList">
        {snippets.map(snippet => (
          <div key={snippet.id} className="snippetItem">
            {editingId === snippet.id ? (
              this.renderEditForm()
            ) : (
              <>
                <div className="snippetInfo">
                  <div className="snippetHeader">
                    <span className="snippetAlias">/{snippet.alias}</span>
                    {snippet.usageCount > 0 && (
                      <span className="snippetUsage">使用 {snippet.usageCount} 次</span>
                    )}
                  </div>
                  {snippet.description && (
                    <div className="snippetDesc">{snippet.description}</div>
                  )}
                  <div className="snippetContent">
                    {snippet.content.substring(0, 50)}
                    {snippet.content.length > 50 ? '...' : ''}
                  </div>
                </div>
                <div className="snippetActions">
                  <button
                    className="btnEdit"
                    onClick={() => this.startEditSnippet(snippet)}
                  >
                    编辑
                  </button>
                  <button
                    className="btnDelete"
                    onClick={() => this.handleDeleteSnippet(snippet.id)}
                  >
                    删除
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { showAddForm } = this.state;

    return (
      <div className="TabCarrier SnippetsTab">
        <div className="snippetHeaderRow">
          <div>
            <h4>快捷码</h4>
            <p className="sub">在编辑器中输入 / 触发快捷码，快速插入常用内容。</p>
          </div>
          {!showAddForm && (
            <button
              className="btnAdd"
              onClick={() => this.setState({ showAddForm: true })}
            >
              + 新建快捷码
            </button>
          )}
        </div>

        {showAddForm && this.renderAddForm()}
        {this.renderSnippetList()}
      </div>
    );
  }
}

export default Snippets;
