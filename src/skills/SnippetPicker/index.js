import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import API from '../../js/api';

class SnippetPicker extends Component {
  state = {
    snippets: [],
    filteredSnippets: [],
    selectedIndex: 0,
    keyword: ''
  }

  componentDidMount() {
    this.loadSnippets();
    // 聚焦后选择所有文本，方便替换
    setTimeout(() => {
      if (this.inputRef) {
        this.inputRef.focus();
        this.inputRef.select();
      }
    }, 10);
    // 添加点击外部关闭
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside = (e) => {
    if (this.pickerRef && !this.pickerRef.contains(e.target)) {
      this.props.onCancel();
    }
  }

  scrollToSelected = () => {
    const { selectedIndex } = this.state;
    const selectedElement = this.itemRefs && this.itemRefs[selectedIndex];
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  loadSnippets = async () => {
    const snippets = await API.getSnippets();
    // 按使用次数排序
    const sorted = snippets.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    this.setState({
      snippets: sorted,
      filteredSnippets: sorted
    });
  }

  handleKeyDown = (e) => {
    const { filteredSnippets, selectedIndex } = this.state;
    const { onSelect, onCancel } = this.props;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onCancel();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.setState({
          selectedIndex: Math.min(selectedIndex + 1, filteredSnippets.length - 1)
        }, () => this.scrollToSelected());
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.setState({
          selectedIndex: Math.max(selectedIndex - 1, 0)
        }, () => this.scrollToSelected());
        break;
      case 'Tab':
      case 'Enter':
        e.preventDefault();
        if (filteredSnippets[selectedIndex]) {
          this.selectSnippet(filteredSnippets[selectedIndex]);
        }
        break;
      default:
        break;
    }
  }

  handleInputChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    const { snippets } = this.state;

    // 过滤快捷码
    const filtered = keyword
      ? snippets.filter(s =>
          s.alias.toLowerCase().includes(keyword) ||
          (s.description && s.description.toLowerCase().includes(keyword))
        )
      : snippets.slice(0, 5);

    this.setState({
      keyword: e.target.value,
      filteredSnippets: filtered,
      selectedIndex: 0
    });
  }

  selectSnippet = async (snippet) => {
    const { onSelect } = this.props;

    // 增加使用次数
    await API.incrementSnippetUsage(snippet.id);

    // 调用回调，传入内容
    onSelect(snippet.content);
  }

  renderPicker() {
    const { filteredSnippets, selectedIndex } = this.state;
    const { position } = this.props;

    // 使用 fixed 定位，避免被父元素裁剪
    const style = position ? {
      position: 'fixed',
      top: position.top + 20,
      left: position.left
    } : {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };

    return (
      <div
        ref={ref => this.pickerRef = ref}
        className="SnippetPicker"
        style={style}
      >
        <input
          ref={ref => this.inputRef = ref}
          className="SnippetPickerInput"
          placeholder="输入快捷码..."
          value={this.state.keyword}
          onChange={this.handleInputChange}
          onKeyDown={this.handleKeyDown}
        />
        <div className="SnippetPickerList">
          {filteredSnippets.length === 0 ? (
            <div className="SnippetPickerEmpty">
              无匹配快捷码
            </div>
          ) : (
            filteredSnippets.map((snippet, index) => (
              <div
                key={snippet.id}
                ref={ref => {
                  if (!this.itemRefs) this.itemRefs = [];
                  this.itemRefs[index] = ref;
                }}
                className={`SnippetItem ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => this.selectSnippet(snippet)}
                onMouseEnter={() => this.setState({ selectedIndex: index })}
              >
                <div className="SnippetAlias">/{snippet.alias}</div>
                <div className="SnippetPreview">
                  {snippet.description || snippet.content.substring(0, 30)}...
                </div>
              </div>
            ))
          )}
        </div>
        <div className="SnippetPickerFooter">
          <span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span>
          <span><kbd>Tab</kbd> 展开</span>
          <span><kbd>Esc</kbd> 取消</span>
        </div>
      </div>
    );
  }

  render() {
    // 使用 Portal 渲染到 body，避免被父元素裁剪
    return ReactDOM.createPortal(
      this.renderPicker(),
      document.body
    );
  }
}

export default SnippetPicker;
