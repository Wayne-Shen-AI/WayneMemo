import React, { Component } from 'react';
import './style.css';
import API from '../../js/api';

class QuickSearch extends Component {
  state = {
    isOpen: false,
    keyword: '',
    results: [],
    selectedIndex: 0
  }

  componentDidMount() {
    // 监听全局快捷键 Cmd+. 或 Ctrl+.
    document.addEventListener('keydown', this.handleGlobalKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
  }

  handleGlobalKeyDown = (e) => {
    // Cmd+. 或 Ctrl+.
    if ((e.metaKey || e.ctrlKey) && e.key === '.') {
      e.preventDefault();
      this.toggleSearch();
    }

    // ESC 关闭
    if (e.key === 'Escape' && this.state.isOpen) {
      this.closeSearch();
    }

    // 上下箭头选择
    if (this.state.isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.setState(prev => ({
          selectedIndex: Math.min(prev.selectedIndex + 1, prev.results.length - 1)
        }));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.setState(prev => ({
          selectedIndex: Math.max(prev.selectedIndex - 1, 0)
        }));
      }
      // Enter 打开
      if (e.key === 'Enter' && this.state.results.length > 0) {
        this.openNote(this.state.results[this.state.selectedIndex].id);
      }
    }
  }

  toggleSearch = () => {
    if (this.state.isOpen) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  }

  openSearch = () => {
    this.setState({
      isOpen: true,
      keyword: '',
      results: [],
      selectedIndex: 0
    }, () => {
      // 聚焦输入框
      if (this.searchInput) {
        this.searchInput.focus();
      }
      // 加载最近笔记
      this.loadRecentNotes();
    });
  }

  closeSearch = () => {
    this.setState({ isOpen: false });
  }

  loadRecentNotes = async () => {
    const notes = await API.getSheets(1);
    this.setState({ results: notes.slice(0, 10) });
  }

  handleSearch = async (e) => {
    const keyword = e.target.value;
    this.setState({ keyword, selectedIndex: 0 });

    if (!keyword.trim()) {
      this.loadRecentNotes();
      return;
    }

    // 搜索笔记
    const results = await API.searchSheets(keyword);
    this.setState({ results: results.slice(0, 10) });
  }

  openNote = (noteId) => {
    this.closeSearch();
    API.event.emit('sheet', noteId.toString());
  }

  highlightText = (text, keyword) => {
    // 防御处理：确保 text 是字符串
    if (!text) return '';
    if (!keyword || !keyword.trim()) return String(text);
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return String(text).replace(regex, '<mark>$1</mark>');
  }

  render() {
    const { isOpen, keyword, results, selectedIndex } = this.state;

    if (!isOpen) return null;

    return (
      <div className="QuickSearchOverlay" onClick={this.closeSearch}>
        <div className="QuickSearchModal" onClick={e => e.stopPropagation()}>
          <div className="QuickSearchInputWrapper">
            <span className="QuickSearchIcon">🔍</span>
            <input
              ref={ref => this.searchInput = ref}
              type="text"
              className="QuickSearchInput"
              placeholder="搜索笔记..."
              value={keyword}
              onChange={this.handleSearch}
            />
            <span className="QuickSearchHint">ESC 关闭</span>
          </div>

          <div className="QuickSearchResults">
            {results.length === 0 ? (
              <div className="QuickSearchEmpty">
                {keyword ? '没有找到匹配的笔记' : '输入关键词搜索笔记'}
              </div>
            ) : (
              results.map((note, index) => (
                <div
                  key={note.id}
                  className={`QuickSearchResultItem ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => this.openNote(note.id)}
                  onMouseEnter={() => this.setState({ selectedIndex: index })}
                >
                  <div className="ResultTitle">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: this.highlightText(note.title || '无标题', keyword)
                      }}
                    />
                  </div>
                  <div className="ResultPreview">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: this.highlightText(note.first_line || '', keyword)
                      }}
                    />
                  </div>
                  <div className="ResultMeta">
                    <span>{new Date(note.accessed_at * 1000).toLocaleDateString()} 访问</span>
                    <span>{note.line_count} 行</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="QuickSearchFooter">
            <span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span>
            <span><kbd>↵</kbd> 打开</span>
          </div>
        </div>
      </div>
    );
  }
}

export default QuickSearch;
