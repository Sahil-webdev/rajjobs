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
  placeholder = "Start writing here...",
  label = "Content Editor"
}: TextFormattingEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState("0");
  const [tableCols, setTableCols] = useState("0");
  const [tableHeaders, setTableHeaders] = useState("firstRow");
  const [tableBorderSize, setTableBorderSize] = useState("1");
  const [tableWidth, setTableWidth] = useState("100");
  const [editingTable, setEditingTable] = useState<HTMLTableElement | null>(null);
  
  // PDF upload states
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfLinkText, setPdfLinkText] = useState("");
  const [selectedTextForPdf, setSelectedTextForPdf] = useState("");
  
  // Context menu for table
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; cell: HTMLTableCellElement } | null>(null);
  
  // ⭐ Active states for formatting (REAL-TIME DETECTION)
  const [activeBold, setActiveBold] = useState(false);
  const [activeItalic, setActiveItalic] = useState(false);
  const [activeUnderline, setActiveUnderline] = useState(false);
  const [activeStrike, setActiveStrike] = useState(false);
  const [currentBlockFormat, setCurrentBlockFormat] = useState('normal'); // Track heading/paragraph
  
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null); // 💾 Save selection for link
  const [isFocused, setIsFocused] = useState(false);
  const [editorHeight, setEditorHeight] = useState(500); // ↔️ RESIZABLE EDITOR
  const isResizingRef = useRef(false);
  const isTypingRef = useRef(false);

  // Load content when value changes
  useEffect(() => {
    if (editorRef.current && !isTypingRef.current) {
      const currentContent = editorRef.current.innerHTML || '';
      const newContent = value || '';
      
      if (currentContent !== newContent) {
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [value]);

  // ⭐ UPDATE ACTIVE STATES - Real-time format detection
  const updateActiveStates = () => {
    try {
      setActiveBold(document.queryCommandState('bold'));
      setActiveItalic(document.queryCommandState('italic'));
      setActiveUnderline(document.queryCommandState('underline'));
      setActiveStrike(document.queryCommandState('strikeThrough'));
      
      // Detect current block format (h1, h2, h3, etc.)
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        let node = selection.anchorNode.nodeType === 3 
          ? selection.anchorNode.parentElement 
          : selection.anchorNode as HTMLElement;
        
        // Walk up to find block element
        while (node && node !== editorRef.current) {
          const tagName = node.tagName?.toLowerCase();
          if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tagName)) {
            setCurrentBlockFormat(tagName === 'p' ? 'normal' : tagName);
            return;
          }
          node = node.parentElement as HTMLElement;
        }
      }
      setCurrentBlockFormat('normal');
    } catch (e) {
      // Silently handle errors
    }
  };

  // Handle content changes
  const cleanupSpanTags = () => {
    if (!editorRef.current) return;
    
    // Remove unnecessary span tags from headings and paragraphs
    const headings = editorRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
    headings.forEach(heading => {
      const spans = heading.querySelectorAll('span');
      spans.forEach(span => {
        // Only remove spans that have only style attributes
        if (span.attributes.length === 1 && span.attributes[0]?.name === 'style') {
          // Move children outside span
          while (span.firstChild) {
            span.parentNode?.insertBefore(span.firstChild, span);
          }
          span.parentNode?.removeChild(span);
        }
      });
    });

    // Also clean up table cells - remove nested spans that are creating layout issues
    const tableCells = editorRef.current.querySelectorAll('td, th');
    tableCells.forEach(cell => {
      const spans = cell.querySelectorAll('span');
      spans.forEach(span => {
        // For table cells, only keep spans with classes, remove style-only spans
        if (span.attributes.length === 1 && span.attributes[0]?.name === 'style') {
          while (span.firstChild) {
            span.parentNode?.insertBefore(span.firstChild, span);
          }
          span.parentNode?.removeChild(span);
        }
      });
    });
  };

  const handleInput = () => {
    if (editorRef.current) {
      isTypingRef.current = true;
      cleanupSpanTags(); // Clean up span tags after each input
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateActiveStates(); // Update button states as user types
      setTimeout(() => { isTypingRef.current = false; }, 100);
    }
  };

  // ⭐ SINGLE-CLICK FORMATTING - No more double-click needed!
  const execCmd = (command: string, value: any = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
    setTimeout(updateActiveStates, 50); // Update states after command
  };

  // 🔢 FONT SIZES: 8 to 90 with 2px gap (40+ options!)
  const fontSizes = [];
  for (let i = 8; i <= 90; i += 2) {
    fontSizes.push(i);
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    if (size && size !== 'default') {
      // Use standard execCommand instead of insertHTML with span tags
      // This applies font size without wrapping in span tags
      execCmd('fontSize', false, '7'); // Size index 7 = 48px
      
      // Apply the exact size using CSS class approach
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        span.style.lineHeight = 'inherit';
        range.surroundContents(span);
        handleInput();
      }
    }
  };

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const heading = e.target.value;
    if (heading === 'normal') {
      execCmd('formatBlock', 'p');
      // Remove any nested span tags inside the paragraph
      if (editorRef.current) {
        const paragraphs = editorRef.current.querySelectorAll('p > span');
        paragraphs.forEach(span => {
          while (span.firstChild) {
            span.parentNode?.insertBefore(span.firstChild, span);
          }
          span.parentNode?.removeChild(span);
        });
      }
    } else {
      execCmd('formatBlock', heading);
      // Remove any nested span tags inside headings
      if (editorRef.current) {
        const headings = editorRef.current.querySelectorAll(`${heading} > span`);
        headings.forEach(span => {
          while (span.firstChild) {
            span.parentNode?.insertBefore(span.firstChild, span);
          }
          span.parentNode?.removeChild(span);
        });
      }
    }
  };

  // 🎨 TABLE MODAL - Beautiful dialog with edit/delete!
  const handleTableButtonClick = () => {
    // Check if user clicked on existing table
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      let node = selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode as HTMLElement;
      
      // Walk up to find table
      while (node && node !== editorRef.current) {
        if (node.tagName === 'TABLE') {
          setEditingTable(node as HTMLTableElement);
          const rows = node.querySelectorAll('tr').length.toString();
          const cols = node.querySelector('tr')?.querySelectorAll('th, td').length.toString() || "2";
          setTableRows(rows);
          setTableCols(cols);
          setShowTableModal(true);
          return;
        }
        node = node.parentElement!;
      }
    }
    
    // No table found, create new
    setEditingTable(null);
    setTableRows("0");
    setTableCols("0");
    // 💾 Save cursor position before opening modal
    saveSelection();
    setTableHeaders("firstRow");
    setTableBorderSize("1");
    setTableWidth("100");
    setShowTableModal(true);
  };

  const handleInsertTable = () => {
    const numRows = parseInt(tableRows);
    const numCols = parseInt(tableCols);
    
    console.log('🔧 Table Insert - Rows:', tableRows, 'Parsed:', numRows);
    console.log('🔧 Table Insert - Cols:', tableCols, 'Parsed:', numCols);
    
    if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) {
      alert("Please enter valid numbers (minimum 1 row and 1 column)");
      return;
    }
    
    // Warning for large tables (not blocking)
    if (numRows > 20 || numCols > 10) {
      const confirmed = confirm("Large table detected. This may slow down the editor. Continue?");
      console.log('⚠️ Large table warning - User confirmed:', confirmed);
      if (!confirmed) return;
    }
    
    const borderSize = parseInt(tableBorderSize) || 1;
    const width = parseInt(tableWidth) || 100;
    
    console.log('✅ Creating table:', numRows, 'x', numCols);
    
    let tableHTML = `<table border="${borderSize}" style="border-collapse: collapse; width: 100%; max-width: 100%; margin: 16px 0; table-layout: auto; overflow-x: auto;"><tbody>`;
    
    for (let i = 0; i < numRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < numCols; j++) {
        const isHeader = (tableHeaders === 'firstRow' && i === 0) || 
                        (tableHeaders === 'firstCol' && j === 0) ||
                        (tableHeaders === 'both' && (i === 0 || j === 0));
        const tag = isHeader ? 'th' : 'td';
        tableHTML += `<${tag} style="border: ${borderSize}px solid #cbd5e0; padding: 10px 12px; font-size: 14px; line-height: 1.5; word-wrap: break-word; overflow-wrap: break-word; ${isHeader ? 'background: #f7fafc; font-weight: 600; color: #2d3748;' : 'background: white; color: #4a5568;'}">${isHeader ? (i === 0 ? `Column ${j+1}` : `Row ${i+1}`) : ''}</${tag}>`;
      }
      tableHTML += '</tr>';
    }
    
    tableHTML += '</tbody></table><p><br></p>';
    
    console.log('📝 Table HTML length:', tableHTML.length);
    console.log('📝 Table HTML preview:', tableHTML.substring(0, 200));
    
    // Close modal first
    setShowTableModal(false);
    
    // Focus editor and insert after a brief delay to ensure focus is set
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        
        // 🎯 Restore the saved cursor position from before modal was opened
        restoreSelection();
        
        // Insert table at cursor position
        document.execCommand('insertHTML', false, tableHTML);
        console.log('✅ Table inserted successfully at cursor position');
        
        // Update content
        handleInput();
      }
    }, 100);
    
    // Reset form
    setTableRows("0");
    setTableCols("0");
    setEditingTable(null);
  };

  const handleDeleteTable = () => {
    if (editingTable && confirm("Are you sure you want to delete this table?")) {
      editingTable.remove();
      handleInput();
      setShowTableModal(false);
      setEditingTable(null);
    }
  };

  // 📄 PDF UPLOAD HANDLER
  const handlePdfUpload = async () => {
    console.log('PDF Upload Started');
    console.log('PDF File:', pdfFile?.name, pdfFile?.size);
    console.log('Link Text:', pdfLinkText);
    
    if (!pdfFile) {
      alert("Please select a PDF file!");
      return;
    }
    if (!pdfLinkText.trim()) {
      alert("Please enter link text!");
      return;
    }

    setPdfUploading(true);
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    try {
      const token = localStorage.getItem('accessToken');
      console.log('📤 Uploading to:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/file/upload-pdf`);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/file/upload-pdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          credentials: 'include'
        }
      );

      const result = await response.json();
      console.log('📥 Upload Response:', result);
      
      // Backend sends URL in result.data.url
      const uploadedUrl = result.data?.url || result.url;
      
      if (result.success && uploadedUrl) {
        // Use pdf-proxy URL for better compatibility
        const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/pdf-proxy?url=${encodeURIComponent(uploadedUrl)}`;
        
        // Close modal first
        setShowPdfUpload(false);
        setPdfUploading(false);
        
        // Insert link after modal closes
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            
            // Restore selection if saved
            if (savedSelectionRef.current) {
              try {
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(savedSelectionRef.current);
                console.log('✅ Selection restored successfully');
              } catch (e) {
                console.warn('⚠️ Could not restore selection, will insert at end');
                // If restoration fails, insert at end
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
              }
            } else {
              // No saved selection, insert at end
              const selection = window.getSelection();
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              range.collapse(false);
              selection?.removeAllRanges();
              selection?.addRange(range);
            }
            
            // Insert link with PDF icon - wraps selected text if any
            const displayText = pdfLinkText || 'PDF Document';
            const pdfHtml = `<a href="${proxyUrl}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-weight: 500;">${displayText}</a>&nbsp;`;
            document.execCommand('insertHTML', false, pdfHtml);
            console.log('✅ PDF link inserted:', displayText);
            
            // Update content
            handleInput();
          }
        }, 150);
        
        // Reset form
        setPdfFile(null);
        setPdfLinkText("");
        setSelectedTextForPdf("");
        savedSelectionRef.current = null;
      } else {
        console.error('❌ Upload failed:', result.message);
        alert(result.message || 'Failed to upload PDF');
      }
    } catch (error) {
      console.error('❌ PDF upload error:', error);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setPdfUploading(false);
    }
  };

  const handlePdfButtonClick = () => {
    console.log('PDF Button Clicked');
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || "";
    console.log('Current selection:', selectedText);
    
    // Save both the range and the selected text
    saveSelection();
    setSelectedTextForPdf(selectedText);
    
    // Pre-fill link text with selected text if available
    if (selectedText) {
      setPdfLinkText(selectedText);
    }
    
    setShowPdfUpload(true);
    console.log('📄 PDF Modal opened with selected text:', selectedText);
  };

  // 🖱️ TABLE CONTEXT MENU HANDLERS
  const handleTableContextMenu = (e: React.MouseEvent) => {
    // Check if click is inside a table cell
    let target = e.target as HTMLElement;
    while (target && target !== editorRef.current) {
      if (target.tagName === 'TD' || target.tagName === 'TH') {
        e.preventDefault();
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          cell: target as HTMLTableCellElement
        });
        return;
      }
      target = target.parentElement as HTMLElement;
    }
  };

  const deleteTableRow = () => {
    if (!contextMenu) return;
    const row = contextMenu.cell.parentElement as HTMLTableRowElement;
    const table = row.parentElement?.parentElement as HTMLTableElement;
    if (table && table.rows.length > 1) {
      row.remove();
      handleInput();
    } else {
      alert("Cannot delete the last row!");
    }
    setContextMenu(null);
  };

  const deleteTableColumn = () => {
    if (!contextMenu) return;
    const cellIndex = contextMenu.cell.cellIndex;
    const row = contextMenu.cell.parentElement as HTMLTableRowElement;
    const table = row.parentElement?.parentElement as HTMLTableElement;
    
    if (table) {
      const colCount = table.rows[0]?.cells.length || 0;
      if (colCount <= 1) {
        alert("Cannot delete the last column!");
        return;
      }
      
      // Delete cell from each row
      Array.from(table.rows).forEach(row => {
        if (row.cells[cellIndex]) {
          row.deleteCell(cellIndex);
        }
      });
      handleInput();
    }
    setContextMenu(null);
  };

  const insertTableRowAbove = () => {
    if (!contextMenu) return;
    const currentRow = contextMenu.cell.parentElement as HTMLTableRowElement;
    const table = currentRow.parentElement?.parentElement as HTMLTableElement;
    
    if (table) {
      const colCount = currentRow.cells.length;
      const newRow = table.insertRow(currentRow.rowIndex);
      
      for (let i = 0; i < colCount; i++) {
        const newCell = newRow.insertCell();
        newCell.style.border = '1px solid #cbd5e0';
        newCell.style.padding = '10px 12px';
        newCell.style.fontSize = '14px';
        newCell.style.lineHeight = '1.5';
        newCell.style.wordWrap = 'break-word';
        newCell.style.overflowWrap = 'break-word';
        newCell.style.background = 'white';
        newCell.style.color = '#4a5568';
      }
      handleInput();
    }
    setContextMenu(null);
  };

  const insertTableColumnLeft = () => {
    if (!contextMenu) return;
    const cellIndex = contextMenu.cell.cellIndex;
    const row = contextMenu.cell.parentElement as HTMLTableRowElement;
    const table = row.parentElement?.parentElement as HTMLTableElement;
    
    if (table) {
      Array.from(table.rows).forEach(row => {
        const newCell = row.insertCell(cellIndex);
        newCell.style.border = '1px solid #cbd5e0';
        newCell.style.padding = '10px 12px';
        newCell.style.fontSize = '14px';
        newCell.style.lineHeight = '1.5';
        newCell.style.wordWrap = 'break-word';
        newCell.style.overflowWrap = 'break-word';
        newCell.style.background = 'white';
        newCell.style.color = '#4a5568';
      });
      handleInput();
    }
    setContextMenu(null);
  };

  // Close context menu on click outside
  useEffect(() => {
    const closeContextMenu = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', closeContextMenu);
      return () => document.removeEventListener('click', closeContextMenu);
    }
  }, [contextMenu]);

  // 💾 SAVE SELECTION - for link functionality
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (savedSelectionRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
  };

  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") {
      alert("Please select text first!");
      return;
    }
    saveSelection(); // 💾 Save before showing input
    setShowLinkInput(true);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      alert("Please enter URL!");
      return;
    }
    
    restoreSelection(); // 🔄 Restore selection
    
    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    execCmd('createLink', url);
    setLinkUrl("");
    setShowLinkInput(false);
    savedSelectionRef.current = null;
  };

  // ↔️ RESIZABLE EDITOR - Drag to resize!
  const handleMouseDown = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    const startY = e.clientY;
    const startHeight = editorHeight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(200, Math.min(1000, startHeight + deltaY));
      setEditorHeight(newHeight);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // ⭐ TOOLBAR BUTTON with ACTIVE STATE highlighting
  const ToolbarButton = ({ onClick, title, active = false, children }: any) => (
    <button
      type="button"
      onMouseDown={(e) => { 
        e.preventDefault(); // Prevent focus loss from editor
      }}
      onClick={(e) => { 
        onClick(); // Execute command
      }}
      title={title}
      className="toolbar-btn"
      style={{
        width: '34px',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? '#dbeafe' : 'white', // ⭐ Blue when active!
        border: active ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        color: active ? '#1e40af' : '#475569', // ⭐ Dark blue text when active
        boxShadow: active ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#f8fafc';
          e.currentTarget.style.borderColor = '#cbd5e0';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ marginBottom: '24px', position: 'relative' }}>
      <label style={{ 
        fontWeight: '600', 
        fontSize: '15px', 
        color: '#1e293b',
        marginBottom: '10px',
        display: 'block'
      }}>
        {label}
      </label>

      {/* 🎨 PROFESSIONAL TOOLBAR - Modern & Clean */}
      <div style={{
        position: 'relative', // ✅ Added for absolute positioning of PDF modal
        display: 'flex',
        gap: '6px',
        padding: '10px 12px',
        background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
        borderRadius: '8px 8px 0 0',
        border: '1px solid #e2e8f0',
        borderBottom: '1px solid #cbd5e0',
        alignItems: 'center',
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
      }}>
        {/* 📐 HEADING DROPDOWN - with SIZE PREVIEW! */}
        <select
          value={currentBlockFormat}
          onChange={handleHeadingChange}
          style={{
            padding: '7px 10px',
            border: '1px solid #cbd5e0',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#334155',
            background: 'white',
            cursor: 'pointer',
            fontWeight: '500',
            minWidth: '130px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
          title="Text Style"
        >
          <option value="normal" style={{ fontSize: '14px' }}>Normal Text</option>
          <option value="h1" style={{ fontSize: '32px', fontWeight: 'bold' }}>Heading 1</option>
          <option value="h2" style={{ fontSize: '24px', fontWeight: 'bold' }}>Heading 2</option>
          <option value="h3" style={{ fontSize: '19px', fontWeight: 'bold' }}>Heading 3</option>
          <option value="h4" style={{ fontSize: '16px', fontWeight: 'bold' }}>Heading 4</option>
          <option value="h5" style={{ fontSize: '14px', fontWeight: 'bold' }}>Heading 5</option>
          <option value="h6" style={{ fontSize: '12px', fontWeight: 'bold' }}>Heading 6</option>
        </select>

        {/* 🔢 FONT SIZE DROPDOWN - 8 to 90! */}
        <select
          onChange={handleFontSizeChange}
          style={{
            padding: '7px 10px',
            border: '1px solid #cbd5e0',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#334155',
            background: 'white',
            cursor: 'pointer',
            fontWeight: '500',
            width: '75px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
          title="Font Size"
          defaultValue="default"
        >
          <option value="default" disabled>Size</option>
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>

        <div style={{ width: '1px', height: '32px', background: '#cbd5e0', margin: '0 4px' }} />

        {/* ⭐ Bold - WITH ACTIVE STATE! */}
        <ToolbarButton onClick={() => execCmd('bold')} title="Bold (Ctrl+B)" active={activeBold}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2h5a3 3 0 0 1 2.5 4.71A3.5 3.5 0 0 1 9 13H4V2zm1 5h4a2 2 0 1 0 0-4H5v4zm0 1v4h4a2.5 2.5 0 0 0 0-5H5z"/>
          </svg>
        </ToolbarButton>

        {/* ⭐ Italic - WITH ACTIVE STATE! */}
        <ToolbarButton onClick={() => execCmd('italic')} title="Italic (Ctrl+I)" active={activeItalic}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.5 2h5v1h-2l-3 10h2v1h-5v-1h2l3-10h-2V2z"/>
          </svg>
        </ToolbarButton>

        {/* ⭐ Underline - WITH ACTIVE STATE! */}
        <ToolbarButton onClick={() => execCmd('underline')} title="Underline (Ctrl+U)" active={activeUnderline}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 15h10v1H3v-1zm5-1c-2.21 0-4-1.79-4-4V2h1.5v8c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V2H12v8c0 2.21-1.79 4-4 4z"/>
          </svg>
        </ToolbarButton>

        {/* ⭐ Strikethrough - WITH ACTIVE STATE! */}
        <ToolbarButton onClick={() => execCmd('strikeThrough')} title="Strikethrough" active={activeStrike}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 8h12v1H2V8zm7.5-5c1.38 0 2.5.67 2.5 1.5 0 .55-.3 1.05-.78 1.35L10 7h1.5c.55 0 1 .45 1 1s-.45 1-1 1h-7c-.55 0-1-.45-1-1s.45-1 1-1h3.28l-1.22-.85C5.3 5.55 5 5.05 5 4.5 5 3.67 6.12 3 7.5 3z"/>
          </svg>
        </ToolbarButton>

        <div style={{ width: '1px', height: '32px', background: '#cbd5e0', margin: '0 4px' }} />

        {/* Align Left */}
        <ToolbarButton onClick={() => execCmd('justifyLeft')} title="Align Left">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3h12v1H2V3zm0 3h8v1H2V6zm0 3h12v1H2V9zm0 3h8v1H2v-1z"/>
          </svg>
        </ToolbarButton>

        {/* Align Center */}
        <ToolbarButton onClick={() => execCmd('justifyCenter')} title="Align Center">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3h12v1H2V3zm2 3h8v1H4V6zm-2 3h12v1H2V9zm2 3h8v1H4v-1z"/>
          </svg>
        </ToolbarButton>

        {/* Align Right */}
        <ToolbarButton onClick={() => execCmd('justifyRight')} title="Align Right">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3h12v1H2V3zm4 3h8v1H6V6zm-4 3h12v1H2V9zm4 3h8v1H6v-1z"/>
          </svg>
        </ToolbarButton>

        <div style={{ width: '1px', height: '32px', background: '#cbd5e0', margin: '0 4px' }} />

        {/* ✅ Bullet List - Single click! */}
        <ToolbarButton onClick={() => {
          execCmd('insertUnorderedList');
        }} title="Bullet List">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="3" cy="3" r="1.5"/>
            <circle cx="3" cy="8" r="1.5"/>
            <circle cx="3" cy="13" r="1.5"/>
            <path d="M6 2h9v2H6V2zm0 5h9v2H6V7zm0 5h9v2H6v-2z"/>
          </svg>
        </ToolbarButton>

        {/* ✅ Numbered List - Single click! */}
        <ToolbarButton onClick={() => {
          execCmd('insertOrderedList');
        }} title="Numbered List">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 2h1v3H3V2zm0 5h1v3H3V7zm0 5h1v2H3v-2zm3-10h9v2H6V2zm0 5h9v2H6V7zm0 5h9v2H6v-2z"/>
          </svg>
        </ToolbarButton>

        <div style={{ width: '1px', height: '32px', background: '#cbd5e0', margin: '0 4px' }} />

        {/* 🎨 Table - Opens MODAL with Edit/Delete! */}
        <ToolbarButton onClick={handleTableButtonClick} title="Insert/Edit Table">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2h12v12H2V2zm1 1v3h4V3H3zm5 0v3h5V3H8zM3 7v3h4V7H3zm5 0v3h5V7H8zM3 11v2h4v-2H3zm5 0v2h5v-2H8z"/>
          </svg>
        </ToolbarButton>

        {/* Horizontal Rule */}
        <ToolbarButton onClick={() => execCmd('insertHTML', '<hr style="border:none;border-top:2px solid #e2e8f0;margin:20px 0"/><p><br></p>')} title="Horizontal Line">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="7" width="12" height="2" rx="1"/>
          </svg>
        </ToolbarButton>

        {/* Link */}
        <ToolbarButton onClick={handleLinkClick} title="Insert Link">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0z"/>
          </svg>
        </ToolbarButton>

        {/* PDF Upload */}
        <ToolbarButton onClick={handlePdfButtonClick} title="Upload PDF">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/>
            <path d="M4.603 12.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.701 19.701 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.187-.012.395-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.065.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.716 5.716 0 0 1-.911-.95 11.642 11.642 0 0 0-1.997.406 11.311 11.311 0 0 1-1.021 1.51c-.29.35-.608.655-.926.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.27.27 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.647 12.647 0 0 1 1.01-.193 11.666 11.666 0 0 1-.51-.858 20.741 20.741 0 0 1-.5 1.05zm2.446.45c.15.162.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.881 3.881 0 0 0-.612-.053zM8.078 5.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
          </svg>
        </ToolbarButton>

        {/* Link Input - with preserved selection */}
        {showLinkInput && (
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            padding: '6px 10px',
            background: 'white',
            borderRadius: '6px',
            border: '1.5px solid #3b82f6',
            marginLeft: '8px',
            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.15)'
          }}>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              style={{
                width: '240px',
                padding: '6px 10px',
                border: '1px solid #cbd5e0',
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
              onBlur={(e) => {
                // Don't lose selection when input loses focus
                e.preventDefault();
              }}
            />
            <button
              type="button"
              onClick={applyLink}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              style={{
                padding: '6px 14px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
                savedSelectionRef.current = null;
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              style={{
                padding: '6px 10px',
                background: '#f1f5f9',
                color: '#64748b',
                border: '1px solid #cbd5e0',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* PDF Upload Modal with Backdrop */}
        {showPdfUpload && (
          <>
            {/* Backdrop */}
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9999
              }}
              onClick={() => {
                setShowPdfUpload(false);
                setPdfFile(null);
                setPdfLinkText("");
                setSelectedTextForPdf("");
                savedSelectionRef.current = null;
              }}
            />
            
            {/* Modal */}
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1.5px solid #3b82f6',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              zIndex: 10000,
              minWidth: '450px',
              maxWidth: '90vw'
            }}>
            <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
              📄 Upload PDF File
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
                Link Text *
              </label>
              <input
                type="text"
                value={pdfLinkText}
                onChange={(e) => setPdfLinkText(e.target.value)}
                placeholder="e.g., Download Notification PDF"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
                PDF File *
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
              {pdfFile && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#10b981' }}>
                  ✓ {pdfFile.name} ({(pdfFile.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowPdfUpload(false);
                  setPdfFile(null);
                  setPdfLinkText("");
                  setSelectedTextForPdf("");
                  savedSelectionRef.current = null;
                }}
                style={{
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePdfUpload}
                disabled={pdfUploading}
                style={{
                  padding: '8px 20px',
                  background: pdfUploading ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: pdfUploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {pdfUploading ? 'Uploading...' : 'Upload & Insert'}
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      {/* 👁️ RESIZABLE EDITOR with LIVE PREVIEW */}
      <div style={{ position: 'relative' }}>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => { setIsFocused(true); updateActiveStates(); }}
          onBlur={() => {
            setIsFocused(false);
            cleanupSpanTags(); // Final cleanup when leaving editor
          }}
          onMouseUp={updateActiveStates} // ⭐ Update states when selection changes
          onKeyUp={updateActiveStates}   // ⭐ Update states when cursor moves
          onContextMenu={handleTableContextMenu} // 🖱️ Right-click for table operations
          style={{
            width: '100%',
            height: `${editorHeight}px`,
            padding: '20px',
            borderLeft: isFocused ? '1px solid #3b82f6' : '1px solid #e2e8f0',
            borderRight: isFocused ? '1px solid #3b82f6' : '1px solid #e2e8f0',
            borderBottom: 'none',
            borderTop: 'none',
            fontSize: '15px',
            lineHeight: '1.7',
            background: 'white',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            outline: 'none',
            overflowY: 'auto',
            transition: 'border-color 0.2s',
            color: '#1e293b'
          }}
          data-placeholder={placeholder}
        />

        {/* ↔️ RESIZE HANDLE - Drag to resize! */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            height: '8px',
            background: isFocused ? '#3b82f6' : '#cbd5e0',
            cursor: 'ns-resize',
            borderRadius: '0 0 8px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          title="Drag to resize"
        >
          <div style={{
            width: '40px',
            height: '3px',
            background: 'white',
            borderRadius: '2px',
            opacity: 0.7
          }} />
        </div>
      </div>

      {/* 🎨 ADVANCED TABLE MODAL - Like screenshot with tabs! */}
      {showTableModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => {
          setShowTableModal(false);
          setEditingTable(null);
        }}>
          <div style={{
            background: 'white',
            padding: '0',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            minWidth: '500px',
            maxWidth: '600px'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header with title and close button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 28px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#0f172a'
              }}>
                {editingTable ? 'Table Properties' : 'Insert Table'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowTableModal(false);
                  setEditingTable(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Tab-like section label */}
            <div style={{
              padding: '16px 28px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#3b82f6',
              borderBottom: '2px solid #3b82f6',
              display: 'inline-block',
              marginLeft: '28px'
            }}>
              Table Properties
            </div>

            {/* Content */}
            <div style={{ padding: '28px' }}>
              {/* Row 1: Rows and Width */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    Rows*
                  </label>
                  <input
                    type="number"
                    value={tableRows}
                    onChange={(e) => setTableRows(e.target.value)}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e0'}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    Width
                  </label>
                  <input
                    type="number"
                    value={tableWidth}
                    onChange={(e) => setTableWidth(e.target.value)}
                    min="10"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e0'}
                  />
                </div>
              </div>

              {/* Row 2: Columns (empty space for layout) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    Columns*
                  </label>
                  <input
                    type="number"
                    value={tableCols}
                    onChange={(e) => setTableCols(e.target.value)}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e0'}
                  />
                </div>
                <div>
                  {/* Empty for layout */}
                </div>
              </div>

              {/* Row 3: Headers and Border size */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    Headers
                  </label>
                  <select
                    value={tableHeaders}
                    onChange={(e) => setTableHeaders(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e0'}
                  >
                    <option value="firstRow">First Row</option>
                    <option value="firstCol">First Column</option>
                    <option value="both">Both</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    Border size
                  </label>
                  <input
                    type="number"
                    value={tableBorderSize}
                    onChange={(e) => setTableBorderSize(e.target.value)}
                    min="0"
                    max="10"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e0'}
                  />
                </div>
              </div>
            </div>

            {/* Footer with buttons */}
            <div style={{
              padding: '16px 28px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '12px',
              justifyContent: editingTable ? 'space-between' : 'flex-end'
            }}>
              {editingTable && (
                <button
                  type="button"
                  onClick={handleDeleteTable}
                  style={{
                    padding: '9px 20px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                >
                  Delete
                </button>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowTableModal(false);
                    setTableRows("3");
                    setTableCols("3");
                    setEditingTable(null);
                  }}
                  style={{
                    padding: '9px 20px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #cbd5e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertTable}
                  style={{
                    padding: '9px 24px',
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🖱️ TABLE CONTEXT MENU - Right-click on table cells */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'white',
            border: '1px solid #cbd5e0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
            minWidth: '180px',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '8px 0' }}>
            <button
              type="button"
              onClick={insertTableRowAbove}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '16px' }}>➕</span>
              Insert Row Above
            </button>
            <button
              type="button"
              onClick={insertTableColumnLeft}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '16px' }}>➕</span>
              Insert Column Left
            </button>
            <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
            <button
              type="button"
              onClick={deleteTableRow}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '16px' }}>➖</span>
              Delete Row
            </button>
            <button
              type="button"
              onClick={deleteTableColumn}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '16px' }}>↕️</span>
              Delete Column
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
