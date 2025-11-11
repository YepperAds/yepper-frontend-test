// CSSEditor.js - REPLACE YOUR ENTIRE CSSEditor.js FILE WITH THIS
import React, { useRef } from 'react';

const CSSEditor = ({ value, onChange }) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  const handleScroll = (e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const highlightCSS = (code) => {
    if (!code) return '';
    
    const tokens = [];
    let i = 0;
    
    while (i < code.length) {
      const char = code[i];
      const remaining = code.slice(i);
      
      // Match multi-line comments /* ... */
      if (remaining.startsWith('/*')) {
        const end = code.indexOf('*/', i);
        if (end !== -1) {
          const comment = code.slice(i, end + 2);
          tokens.push({ type: 'comment', value: comment });
          i = end + 2;
          continue;
        }
      }
      
      // Match selectors (word followed by {)
      if (remaining.match(/^[.#a-zA-Z0-9_-]+\s*\{/)) {
        const match = remaining.match(/^([.#a-zA-Z0-9_-]+)(\s*)(\{)/);
        tokens.push({ type: 'selector', value: match[1] });
        tokens.push({ type: 'whitespace', value: match[2] });
        tokens.push({ type: 'punctuation', value: match[3] });
        i += match[0].length;
        continue;
      }
      
      // Match property names (word followed by :)
      if (remaining.match(/^[a-z-]+\s*:/)) {
        const match = remaining.match(/^([a-z-]+)(\s*)(:)/);
        tokens.push({ type: 'property', value: match[1] });
        tokens.push({ type: 'whitespace', value: match[2] });
        tokens.push({ type: 'punctuation', value: match[3] });
        i += match[0].length;
        continue;
      }
      
      // Match hex colors
      if (remaining.match(/^#[0-9a-fA-F]{3,8}/)) {
        const match = remaining.match(/^#[0-9a-fA-F]{3,8}/)[0];
        tokens.push({ type: 'color', value: match });
        i += match.length;
        continue;
      }
      
      // Match rgba/rgb
      if (remaining.match(/^rgba?\([^)]+\)/)) {
        const match = remaining.match(/^rgba?\([^)]+\)/)[0];
        tokens.push({ type: 'color', value: match });
        i += match.length;
        continue;
      }
      
      // Match numbers with units
      if (remaining.match(/^\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms|deg)\b/)) {
        const match = remaining.match(/^\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms|deg)/)[0];
        tokens.push({ type: 'number', value: match });
        i += match.length;
        continue;
      }
      
      // Match plain numbers
      if (remaining.match(/^\d+(\.\d+)?/)) {
        const match = remaining.match(/^\d+(\.\d+)?/)[0];
        tokens.push({ type: 'number', value: match });
        i += match.length;
        continue;
      }
      
      // Match keywords
      if (remaining.match(/^\b(none|auto|flex|inline-flex|block|inline|relative|absolute|fixed|center|left|right|top|bottom|bold|normal|ease|linear|blur|brightness|hidden|visible|transparent|solid|border-box|content-box)\b/)) {
        const match = remaining.match(/^\b(none|auto|flex|inline-flex|block|inline|relative|absolute|fixed|center|left|right|top|bottom|bold|normal|ease|linear|blur|brightness|hidden|visible|transparent|solid|border-box|content-box)\b/)[0];
        tokens.push({ type: 'keyword', value: match });
        i += match.length;
        continue;
      }
      
      // Match punctuation
      if (char.match(/[{}();,]/)) {
        tokens.push({ type: 'punctuation', value: char });
        i++;
        continue;
      }
      
      // Everything else (whitespace, semicolons, etc)
      tokens.push({ type: 'text', value: char });
      i++;
    }
    
    // Convert tokens to HTML
    return tokens.map(token => {
      const escaped = token.value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/ /g, '&nbsp;')
        .replace(/\n/g, '<br/>');
      
      switch (token.type) {
        case 'comment':
          return `<span style="color: #6A9955;">${escaped}</span>`;
        case 'selector':
          return `<span style="color: #D7BA7D;">${escaped}</span>`;
        case 'property':
          return `<span style="color: #9CDCFE;">${escaped}</span>`;
        case 'color':
          return `<span style="color: #CE9178;">${escaped}</span>`;
        case 'number':
          return `<span style="color: #B5CEA8;">${escaped}</span>`;
        case 'keyword':
          return `<span style="color: #569CD6;">${escaped}</span>`;
        case 'punctuation':
          return `<span style="color: #D4D4D4;">${escaped}</span>`;
        case 'whitespace':
          return escaped;
        default:
          return escaped;
      }
    }).join('');
  };

  const handleTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const lineCount = value.split('\n').length;

  return (
    <div style={{
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #3e3e3e',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      {/* Editor Header */}
      <div style={{
        background: '#1e1e1e',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #3e3e3e'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
          </div>
          <span style={{ fontSize: '12px', color: '#858585', fontFamily: 'monospace', marginLeft: '12px' }}>styles.css</span>
        </div>
        <span style={{ fontSize: '11px', color: '#6e6e6e' }}>CSS</span>
      </div>

      {/* Editor Body */}
      <div style={{
        display: 'flex',
        background: '#1e1e1e',
        height: '500px'
      }}>
        {/* Line Numbers */}
        <div style={{
          background: '#1e1e1e',
          padding: '16px 12px',
          textAlign: 'right',
          borderRight: '1px solid #3e3e3e',
          userSelect: 'none',
          minWidth: '45px'
        }}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} style={{
              color: '#858585',
              fontSize: '13px',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              lineHeight: '21px',
              height: '21px'
            }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor Content */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Syntax Highlighted Background */}
          <div
            ref={highlightRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              margin: 0,
              padding: '16px',
              fontSize: '13px',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              lineHeight: '21px',
              color: '#D4D4D4',
              background: 'transparent',
              overflow: 'auto',
              whiteSpace: 'pre',
              wordWrap: 'normal',
              pointerEvents: 'none'
            }}
            dangerouslySetInnerHTML={{ __html: highlightCSS(value) }}
          />

          {/* Actual Textarea (transparent) */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleTab}
            placeholder="/* Type your CSS here... */"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              margin: 0,
              padding: '16px',
              fontSize: '13px',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              lineHeight: '21px',
              color: 'transparent',
              caretColor: '#fff',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              overflow: 'auto',
              whiteSpace: 'pre',
              wordWrap: 'normal',
              tabSize: 2,
              WebkitTextFillColor: 'transparent'
            }}
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        background: '#007acc',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>CSS</span>
          <span>{lineCount} lines</span>
        </div>
        <div>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};

export default CSSEditor;