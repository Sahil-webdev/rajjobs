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
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState("3");
  const isTypingRef = useRef(false); // Track if user is typing

  // Load content when value changes (for edit mode) but NOT when user is typing
  useEffect(() => {
    // Only update if we're not actively typing
    if (editorRef.current && !isTypingRef.current) {
      const currentContent = editorRef.current.innerHTML || '';
      const newContent = value || '';
      
      // Only update if content is actually different
      if (currentContent !== newContent) {
        console.log('🔄 Editor content updated from props');
        console.log('   Old:', currentContent.substring(0, 100));
        console.log('   New:', newContent.substring(0, 100));
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [value]);

  // Check current formatting state
  const updateFormattingState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
    setIsStrikethrough(document.queryCommandState('strikeThrough'));
    
    // Check if cursor is inside a link
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node = selection.getRangeAt(0).startContainer;
      let isInsideLink = false;
      
      // Traverse up the DOM tree to find if we're inside an <a> tag
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'A') {
          isInsideLink = true;
          break;
        }
        node = node.parentNode as Node;
      }
      
      setIsLink(isInsideLink);
    }
  };

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      isTypingRef.current = true; // Mark as typing to prevent useEffect updates
      const html = editorRef.current.innerHTML;
      
      // 🔍 DEBUG: Log content changes
      console.log('✏️ Editor content changed!');
      console.log('   Length:', html.length);
      console.log('   Preview:', html.substring(0, 200));
      
      onChange(html);
      
      // Reset typing flag after a short delay
      setTimeout(() => {
        isTypingRef.current = false;
      }, 100);
    }
  };

  // Handle selection change
  const handleSelectionChange = () => {
    updateFormattingState();
  };

  // Bold formatting
  const handleBold = () => {
    document.execCommand('bold', false);
    editorRef.current?.focus();
    updateFormattingState();
    handleInput(); // Update content after formatting
  };

  // Italic formatting
  const handleItalic = () => {
    document.execCommand('italic', false);
    editorRef.current?.focus();
    updateFormattingState();
    handleInput();
  };

  // Underline formatting
  const handleUnderline = () => {
    document.execCommand('underline', false);
    editorRef.current?.focus();
    updateFormattingState();
    handleInput();
  };

  // Strikethrough formatting
  const handleStrikethrough = () => {
    document.execCommand('strikeThrough', false);
    editorRef.current?.focus();
    updateFormattingState();
    handleInput();
  };

  // Text Alignment
  const handleAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    const commands = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull'
    };
    document.execCommand(commands[align], false);
    editorRef.current?.focus();
    handleInput();
  };

  // Font Size
  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    setSelectedFontSize(size);
    document.execCommand('fontSize', false, size);
    editorRef.current?.focus();
    handleInput();
  };

  // Horizontal Rule
  const handleHorizontalRule = () => {
    document.execCommand('insertHTML', false, '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 20px 0;" />');
    editorRef.current?.focus();
    handleInput();
  };

  // Bullet List formatting
  const handleBulletList = () => {
    document.execCommand('insertUnorderedList', false);
    editorRef.current?.focus();
    handleInput();
  };

  // Numbered List formatting
  const handleNumberedList = () => {
    document.execCommand('insertOrderedList', false);
    editorRef.current?.focus();
    handleInput();
  };

  // Table insertion
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
    
    document.execCommand('insertHTML', false, tableHTML);
    editorRef.current?.focus();
    handleInput();
  };

  // Heading formatting
  const handleHeading = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const heading = e.target.value;
    setSelectedHeading(heading);
    
    if (heading === 'normal') {
      document.execCommand('formatBlock', false, 'p');
    } else {
      document.execCommand('formatBlock', false, heading);
    }
    
    editorRef.current?.focus();
    updateFormattingState();
    handleInput();
  };

  // Link formatting
  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") {
      alert("कृपया पहले text select करें जिसे link बनाना है!");
      return;
    }
    setShowLinkInput(true);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      alert("कृपया URL enter करें!");
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") {
      alert("कृपया पहले text select करें!");
      setShowLinkInput(false);
      return;
    }

    // Create link element
    const link = document.createElement('a');
    link.href = linkUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.color = "#3b82f6";
    link.style.textDecoration = "underline";
    
    // Wrap selection in link
    try {
      const range = selection.getRangeAt(0);
      range.surroundContents(link);
      selection.removeAllRanges();
    } catch (e) {
      // Fallback: use execCommand
      document.execCommand('createLink', false, linkUrl);
      // Style the created link
      const links = editorRef.current?.querySelectorAll('a');
      if (links && links.length > 0) {
        const lastLink = links[links.length - 1] as HTMLAnchorElement;
        lastLink.style.color = "#3b82f6";
        lastLink.style.textDecoration = "underline";
        lastLink.target = "_blank";
        lastLink.rel = "noopener noreferrer";
      }
    }

    setLinkUrl("");
    setShowLinkInput(false);
    editorRef.current?.focus();
    handleInput();
    updateFormattingState();
  };

  return (
    <div className="form-group" style={{ marginBottom: '24px' }}>
      <label style={{ 
        fontWeight: '600', 
        fontSize: '15px', 
        color: '#1f2937',
        marginBottom: '12px',
        display: 'block'
      }}>
        {label}
      </label>

      {/* Formatting Toolbar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px',
        background: '#ffffff',
        borderRadius: '8px 8px 0 0',
        border: '1px solid #e5e7eb',
        borderBottom: 'none',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Heading Dropdown */}
        <select
          value={selectedHeading}
          onChange={handleHeading}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            background: 'white',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="normal">Normal Text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        <div style={{ width: '1px', height: '30px', background: '#e5e7eb', margin: '0 4px' }} />

        {/* Bold Button */}
        <button
          type="button"
          onClick={handleBold}
          title="Bold (Ctrl+B)"
          style={{
            padding: '8px 12px',
            background: isBold ? '#3b82f6' : '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'all 0.2s',
            color: isBold ? 'white' : '#374151'
          }}
        >
          B
        </button>

        {/* Italic Button */}
        <button
          type="button"
          onClick={handleItalic}
          title="Italic (Ctrl+I)"
          style={{
            padding: '8px 12px',
            background: isItalic ? '#8b5cf6' : '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontStyle: 'italic',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s',
            color: isItalic ? 'white' : '#374151'
          }}
        >
          I
        </button>

        {/* Underline Button */}
        <button
          type="button"
          onClick={handleUnderline}
          title="Underline (Ctrl+U)"
          style={{
            padding: '8px 12px',
            background: isUnderline ? '#ec4899' : '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'underline',
            transition: 'all 0.2s',
            color: isUnderline ? 'white' : '#374151'
          }}
        >
          U
        </button>

        {/* Strikethrough Button */}
        <button
          type="button"
          onClick={handleStrikethrough}
          title="Strikethrough"
          style={{
            padding: '8px 12px',
            background: isStrikethrough ? '#f59e0b' : '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'line-through',
            transition: 'all 0.2s',
            color: isStrikethrough ? 'white' : '#374151'
          }}
        >
          S
        </button>

        <div style={{ width: '1px', height: '30px', background: '#e5e7eb', margin: '0 4px' }} />

        {/* Font Size Selector */}
        <select
          value={selectedFontSize}
          onChange={handleFontSize}
          title="Font Size"
          style={{
            padding: '8px 10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            background: 'white',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="1">Small</option>
          <option value="2">Normal</option>
          <option value="3">Medium</option>
          <option value="4">Large</option>
          <option value="5">X-Large</option>
          <option value="6">XX-Large</option>
        </select>

        <div style={{ width: '1px', height: '30px', background: '#e5e7eb', margin: '0 4px' }} />

        {/* Text Alignment Buttons */}
        <button
          type="button"
          onClick={() => handleAlignment('left')}
          title="Align Left"
          style={{
            padding: '8px 10px',
            background: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          ⬅
        </button>

        <button
          type="button"
          onClick={() => handleAlignment('center')}
          title="Align Center"
          style={{
            padding: '8px 10px',
            background: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          ⬌
        </button>

        <button
          type="button"
          onClick={() => handleAlignment('right')}
          title="Align Right"
          style={{
            padding: '8px 10px',
            background: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          ➡
        </button>

        <div style={{ width: '1px', height: '30px', background: '#e5e7eb', margin: '0 4px' }} />

        {/* Bullet List Button */}
        <button
          type="button"
          onClick={handleBulletList}
          title="Bullet List"
          style={{
            padding: '8px 12px',
            background: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
          •
        </button>

        {/* Numbered List Button */}
        <button
          type="button"
          onClick={handleNumberedList}
          title="Numbered List"
          style={{
            padding: '8px 12px',
            background: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
            color: '#374151'
          }}
        >
          1-2-3
        </button>

        <div style={{ width: '1px', height: '30px', background: '#e5e7eb', margin: '0 4px' }} />

        {/* Table Button */}
        <button
          type="button"
          onClick={handleInsertTable}
          title="Insert Table"
          style={{
            padding: '8px 12px',
            background: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
          ⊞
        </button>

        {/* Horizontal Rule Button */}
        <button
          type="button"
          onClick={handleHorizontalRule}
          title="Insert Horizontal Line"
          style={{
            padding: '8px 12px',
            background: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          ─
        </button>

        {/* Link Button */}
        <button
          type="button"
          onClick={handleLinkClick}
          title="Add Link"
          style={{
            padding: '8px 12px',
            background: isLink ? '#10b981' : '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s',
            color: isLink ? 'white' : '#374151'
          }}
        >
          🔗
        </button>

        {/* Link Input Section */}
        {showLinkInput && (
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            padding: '6px 10px',
            background: '#f0fdf4',
            borderRadius: '6px',
            border: '1px solid #10b981',
            flex: 1,
            minWidth: '300px'
          }}>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              style={{
                flex: 1,
                padding: '6px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
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
                padding: '6px 12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ContentEditable Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onFocus={() => {
          setIsFocused(true);
          updateFormattingState();
        }}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          minHeight: '400px',
          padding: '16px',
          borderLeft: isFocused ? '1px solid #3b82f6' : '1px solid #e5e7eb',
          borderRight: isFocused ? '1px solid #3b82f6' : '1px solid #e5e7eb',
          borderBottom: isFocused ? '1px solid #3b82f6' : '1px solid #e5e7eb',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          fontSize: '14px',
          lineHeight: '1.8',
          background: 'white',
          fontFamily: 'inherit',
          outline: 'none',
          overflowY: 'auto',
          transition: 'border-color 0.2s',
          whiteSpace: 'pre-wrap'
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
