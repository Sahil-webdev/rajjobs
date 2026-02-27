"use client";

import { useState, useRef, useEffect } from "react";

interface TextFormattingEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function TextFormattingEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  label = "Content Editor"
}: TextFormattingEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [selectedHeading, setSelectedHeading] = useState("normal");
  const [selectedFontSize, setSelectedFontSize] = useState("3");
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isTypingRef = useRef(false);

  // Load content when value changes
  useEffect(() => {
    if (editorRef.current && !isTypingRef.current) {
      const currentContent = editorRef.current.innerHTML || '';
      const newContent = value || '';
      
      if (currentContent !== newContent) {
        console.log('🔄 Editor loading content, length:', newContent.length);
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [value]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      isTypingRef.current = true;
      const html = editorRef.current.innerHTML;
      
      console.log('✏️ Editor content changed!');
      console.log('   Length:', html.length);
      console.log('   Preview:', html.substring(0, 200));
      
      onChange(html);
      
      setTimeout(() => {
        isTypingRef.current = false;
      }, 100);
    }
  };

  // Formatting commands
  const execCmd = (command: string, value: any = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleHeading = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const heading = e.target.value;
    setSelectedHeading(heading);
    execCmd('formatBlock', heading === 'normal' ? 'p' : heading);
  };

  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    setSelectedFontSize(size);
    execCmd('fontSize', size);
  };

  const handleInsertTable = () => {
    const rows = prompt("Number of rows:", "3");
    const cols = prompt("Number of columns:", "3");
    
    if (!rows || !cols) return;
    
    const numRows = parseInt(rows);
    const numCols = parseInt(cols);
    
    if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) {
      alert("Please enter valid numbers");
      return;
    }
    
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 16px 0;"><tbody>';
    
    for (let i = 0; i < numRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < numCols; j++) {
        const tag = i === 0 ? 'th' : 'td';
        tableHTML += `<${tag} style="border: 1px solid #ddd; padding: 8px; ${i === 0 ? 'background: #f3f4f6; font-weight: bold;' : ''}">${i === 0 ? 'Header' : 'Cell'}</${tag}>`;
      }
      tableHTML += '</tr>';
    }
    
    tableHTML += '</tbody></table>';
    execCmd('insertHTML', tableHTML);
  };

  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") {
      alert("Please select text first!");
      return;
    }
    setShowLinkInput(true);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      alert("Please enter URL!");
      return;
    }
    execCmd('createLink', linkUrl);
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const ToolbarButton = ({ onClick, title, active = false, children }: any) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? '#e3f2fd' : 'transparent',
        border: active ? '1px solid #2196f3' : '1px solid transparent',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        color: active ? '#1976d2' : '#616161'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#f5f5f5';
          e.currentTarget.style.borderColor = '#e0e0e0';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ 
        fontWeight: '600', 
        fontSize: '14px', 
        color: '#212121',
        marginBottom: '8px',
        display: 'block'
      }}>
        {label}
      </label>

      {/* Toolbar - Microsoft Word Style */}
      <div style={{
        display: 'flex',
        gap: '2px',
        padding: '8px',
        background: '#fafafa',
        borderRadius: '4px 4px 0 0',
        border: '1px solid #e0e0e0',
        borderBottom: '1px solid #bdbdbd',
        alignItems: 'center',
        flexWrap: 'wrap',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        {/* Row 1: Headings and Font Size */}
        <select
          value={selectedHeading}
          onChange={handleHeading}
          style={{
            padding: '6px 8px',
            border: '1px solid #e0e0e0',
            borderRadius: '3px',
            fontSize: '13px',
            color: '#424242',
            background: 'white',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          <option value="normal">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        <select
          value={selectedFontSize}
          onChange={handleFontSize}
          style={{
            padding: '6px 8px',
            border: '1px solid #e0e0e0',
            borderRadius: '3px',
            fontSize: '13px',
            color: '#424242',
            background: 'white',
            cursor: 'pointer',
            marginRight: '12px',
            width: '70px'
          }}
        >
          <option value="1">8pt</option>
          <option value="2">10pt</option>
          <option value="3">12pt</option>
          <option value="4">14pt</option>
          <option value="5">18pt</option>
          <option value="6">24pt</option>
          <option value="7">36pt</option>
        </select>

        <div style={{ width: '1px', height: '28px', background: '#e0e0e0', margin: '0 6px' }} />

        {/* Bold */}
        <ToolbarButton onClick={() => execCmd('bold')} title="Bold (Ctrl+B)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2h5a3 3 0 0 1 2.5 4.71A3.5 3.5 0 0 1 9 13H4V2zm1 5h4a2 2 0 1 0 0-4H5v4zm0 1v4h4a2.5 2.5 0 0 0 0-5H5z"/>
          </svg>
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton onClick={() => execCmd('italic')} title="Italic (Ctrl+I)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.5 2h5v1h-2l-3 10h2v1h-5v-1h2l3-10h-2V2z"/>
          </svg>
        </ToolbarButton>

        {/* Underline */}
        <ToolbarButton onClick={() => execCmd('underline')} title="Underline (Ctrl+U)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 15h10v1H3v-1zm5-1c-2.21 0-4-1.79-4-4V2h1.5v8c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V2H12v8c0 2.21-1.79 4-4 4z"/>
          </svg>
        </ToolbarButton>

        {/* Strikethrough */}
        <ToolbarButton onClick={() => execCmd('strikeThrough')} title="Strikethrough">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 8h12v1H2V8zm7.5-5c1.38 0 2.5.67 2.5 1.5 0 .55-.3 1.05-.78 1.35L10 7h1.5c.55 0 1 .45 1 1s-.45 1-1 1h-7c-.55 0-1-.45-1-1s.45-1 1-1h3.28l-1.22-.85C5.3 5.55 5 5.05 5 4.5 5 3.67 6.12 3 7.5 3z"/>
          </svg>
        </ToolbarButton>

        <div style={{ width: '1px', height: '28px', background: '#e0e0e0', margin: '0 6px' }} />

        {/* Align Left */}
        <ToolbarButton onClick={() => execCmd('justifyLeft')} title="Align Left">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3h12v1H2V3zm0 3h8v1H2V6zm0 3h12v1H2V9zm0 3h8v1H2v-1z"/>
          </svg>
        </ToolbarButton>

        {/* Align Center */}
        <ToolbarButton onClick={() => execCmd('justifyCenter')} title="Align Center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3h12v1H2V3zm2 3h8v1H4V6zm-2 3h12v1H2V9zm2 3h8v1H4v-1z"/>
          </svg>
        </ToolbarButton>

        {/* Align Right */}
        <ToolbarButton onClick={() => execCmd('justifyRight')} title="Align Right">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3h12v1H2V3zm4 3h8v1H6V6zm-4 3h12v1H2V9zm4 3h8v1H6v-1z"/>
          </svg>
        </ToolbarButton>

        <div style={{ width: '1px', height: '28px', background: '#e0e0e0', margin: '0 6px' }} />

        {/* Bullet List */}
        <ToolbarButton onClick={() => execCmd('insertUnorderedList')} title="Bullet List">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="3" cy="3" r="1.5"/>
            <circle cx="3" cy="8" r="1.5"/>
            <circle cx="3" cy="13" r="1.5"/>
            <path d="M6 2h9v2H6V2zm0 5h9v2H6V7zm0 5h9v2H6v-2z"/>
          </svg>
        </ToolbarButton>

        {/* Numbered List */}
        <ToolbarButton onClick={() => execCmd('insertOrderedList')} title="Numbered List">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 2h1v3H3V2zm0 5h1v3H3V7zm0 5h1v2H3v-2zm3-10h9v2H6V2zm0 5h9v2H6V7zm0 5h9v2H6v-2z"/>
          </svg>
        </ToolbarButton>

        <div style={{ width: '1px', height: '28px', background: '#e0e0e0', margin: '0 6px' }} />

        {/* Table */}
        <ToolbarButton onClick={handleInsertTable} title="Insert Table">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2h12v12H2V2zm1 1v3h4V3H3zm5 0v3h5V3H8zM3 7v3h4V7H3zm5 0v3h5V7H8zM3 11v2h4v-2H3zm5 0v2h5v-2H8z"/>
          </svg>
        </ToolbarButton>

        {/* Horizontal Rule */}
        <ToolbarButton onClick={() => execCmd('insertHTML', '<hr style="border:none;border-top:2px solid #e0e0e0;margin:16px 0"/>')} title="Horizontal Line">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="7" width="12" height="2" rx="1"/>
          </svg>
        </ToolbarButton>

        {/* Link */}
        <ToolbarButton onClick={handleLinkClick} title="Insert Link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0z"/>
          </svg>
        </ToolbarButton>

        {/* Link Input */}
        {showLinkInput && (
          <div style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            padding: '4px 8px',
            background: 'white',
            borderRadius: '4px',
            border: '1px solid #2196f3',
            marginLeft: '8px'
          }}>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              style={{
                width: '200px',
                padding: '4px 8px',
                border: '1px solid #e0e0e0',
                borderRadius: '3px',
                fontSize: '13px',
                outline: 'none'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyLink();
                }
              }}
            />
            <button
              type="button"
              onClick={applyLink}
              style={{
                padding: '4px 12px',
                background: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              style={{
                padding: '4px 8px',
                background: '#f5f5f5',
                color: '#424242',
                border: '1px solid #e0e0e0',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          minHeight: '450px',
          maxHeight: '600px',
          padding: '16px',
          borderLeft: isFocused ? '1px solid #2196f3' : '1px solid #e0e0e0',
          borderRight: isFocused ? '1px solid #2196f3' : '1px solid #e0e0e0',
          borderBottom: isFocused ? '1px solid #2196f3' : '1px solid #e0e0e0',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          fontSize: '14px',
          lineHeight: '1.6',
          background: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          outline: 'none',
          overflowY: 'auto',
          transition: 'border-color 0.2s',
          color: '#212121'
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
