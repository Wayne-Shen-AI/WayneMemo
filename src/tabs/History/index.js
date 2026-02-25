import React, { Component } from 'react';
import './style.css';
import API from '../../js/api';

class History extends Component {
  state = {
    logs: [],
    currentNoteId: null,
    selectedLog: null,
    previewContent: null
  }

  componentDidMount() {
    // 从 props 获取当前笔记ID
    if (this.props.sheet && this.props.sheet.id) {
      this.setState({ currentNoteId: this.props.sheet.id }, () => {
        this.loadLogs();
      });
    }

    // 监听笔记切换
    API.event.on('sheet', (id) => {
      if (id && id !== 'NEW_SHEET' && id !== 'LAST_ACCESSED') {
        // 支持数字ID和字符串ID
        const noteId = isNaN(parseInt(id)) ? id : parseInt(id);
        this.setState({ currentNoteId: noteId }, () => {
          this.loadLogs();
        });
      }
    });
  }

  loadLogs = async () => {
    const { currentNoteId } = this.state;
    const logs = await API.getOperationLogs(currentNoteId);
    this.setState({ logs });
  }

  handleRollback = async (log) => {
    if (!window.confirm(`确定要回滚到 ${this.formatTime(log.timestamp)} 的版本吗？\n\n当前内容将被替换。`)) {
      return;
    }

    const result = await API.rollbackNote(log.noteId, log.id);
    if (result.success) {
      // 刷新当前笔记
      API.event.emit('sheet', log.noteId.toString());
      // 刷新笔记列表（标题可能已改变）
      API.event.emit('refreshSheets');
      alert('回滚成功！');
      this.loadLogs();
    } else {
      alert('回滚失败：' + result.error);
    }
  }

  handlePreview = (log) => {
    this.setState({
      selectedLog: log,
      previewContent: log.snapshot
    });
  }

  closePreview = () => {
    this.setState({
      selectedLog: null,
      previewContent: null
    });
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActionText(action) {
    const map = {
      'create': '创建',
      'update': '编辑',
      'delete': '删除',
      'rollback': '回滚'
    };
    return map[action] || action;
  }

  renderPreview() {
    const { selectedLog, previewContent } = this.state;
    if (!selectedLog || !previewContent) return null;

    return (
      <div className="historyPreviewOverlay" onClick={this.closePreview}>
        <div className="historyPreviewModal" onClick={e => e.stopPropagation()}>
          <div className="previewHeader">
            <h5>版本预览 - {this.formatTime(selectedLog.timestamp)}</h5>
            <button className="btnClose" onClick={this.closePreview}>×</button>
          </div>
          <div className="previewContent">
            <div className="previewTitle">{previewContent.title}</div>
            <div className="previewBody">
              {(previewContent.content || '').split('\n').map((line, i) => (
                <div key={i} className="previewLine">{line || ' '}</div>
              ))}
            </div>
          </div>
          <div className="previewActions">
            <button
              className="btnRollback"
              onClick={() => this.handleRollback(selectedLog)}
            >
              回滚到此版本
            </button>
            <button className="btnSecondary" onClick={this.closePreview}>
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { logs, currentNoteId } = this.state;

    return (
      <div className="TabCarrier HistoryTab">
        <div className="historyHeader">
          <div>
            <h4>操作历史</h4>
            <p className="sub">
              {currentNoteId
                ? '查看当前笔记的编辑历史，可回滚到任意版本'
                : '请先选择一个笔记以查看其操作历史'}
            </p>
          </div>
          {currentNoteId && (
            <button className="btnRefresh" onClick={this.loadLogs}>
              刷新
            </button>
          )}
        </div>

        {!currentNoteId ? (
          <div className="historyEmpty">
            <p>请先选择一个笔记</p>
            <p className="sub">操作历史会记录每次编辑的快照</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="historyEmpty">
            <p>暂无操作记录</p>
            <p className="sub">编辑笔记后会自动保存历史版本</p>
          </div>
        ) : (
          <div className="historyList">
            {logs.map((log, index) => (
              <div key={log.id} className={`historyItem ${index === 0 ? 'latest' : ''}`}>
                <div className="historyInfo">
                  <div className="historyTime">
                    {this.formatTime(log.timestamp)}
                    {index === 0 && <span className="latestTag">最新</span>}
                  </div>
                  <div className="historyAction">
                    {this.getActionText(log.action)}
                  </div>
                  {log.snapshot && log.snapshot.title && (
                    <div className="historyTitle">{log.snapshot.title}</div>
                  )}
                </div>
                <div className="historyActions">
                  <button
                    className="btnPreview"
                    onClick={() => this.handlePreview(log)}
                  >
                    预览
                  </button>
                  {index !== 0 && (
                    <button
                      className="btnRollback"
                      onClick={() => this.handleRollback(log)}
                    >
                      回滚
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {this.renderPreview()}
      </div>
    );
  }
}

export default History;
