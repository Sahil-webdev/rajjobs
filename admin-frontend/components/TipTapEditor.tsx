"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import "highlight.js/styles/atom-one-dark.css";
import "./TipTapEditor.css";

interface TipTapEditorProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
}

const lowlight = createLowlight(common);

export default function TipTapEditor({ value, onChange, placeholder }: TipTapEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        allowBase64: true,
      }),
      TableKit.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div style={{ padding: "16px", color: "#999", textAlign: "center" }}>Loading editor...</div>;
  }

  const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "flex", gap: "0", borderRight: "1px solid #e5e7eb", paddingRight: "12px", marginRight: "12px" }}>
      {children}
    </div>
  );

  const ToolButton = ({ 
    onClick, 
    isActive, 
    disabled, 
    label, 
    icon 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    disabled?: boolean; 
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        padding: "8px 10px",
        background: isActive ? "#e0e7ff" : "transparent",
        color: isActive ? "#4f46e5" : "#6b7280",
        border: "none",
        borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.target as HTMLButtonElement).style.background = "#f3f4f6";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.background = isActive ? "#e0e7ff" : "transparent";
      }}
    >
      {icon}
    </button>
  );

  const MenuBar = () => (
    <div 
      style={{ 
        display: "flex", 
        alignItems: "center",
        gap: "8px", 
        padding: "12px 16px", 
        borderBottom: "1px solid #e5e7eb", 
        background: "#fafbfc",
        flexWrap: "wrap"
      }}
    >
      {/* Undo/Redo */}
      <ButtonGroup>
        <ToolButton
          onClick={() => editor.chain().focus().undo().run()}
          label="Undo"
          icon="↶"
        />
        <ToolButton
          onClick={() => editor.chain().focus().redo().run()}
          label="Redo"
          icon="↷"
        />
      </ButtonGroup>

      {/* Heading & Style */}
      <ButtonGroup>
        <select
          onChange={(e) => {
            if (e.target.value === "p") {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(e.target.value);
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          style={{
            padding: "6px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            background: "white",
            color: "#374151",
            fontSize: "14px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <option value="p">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
      </ButtonGroup>

      {/* Text Formatting */}
      <ButtonGroup>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          label="Bold"
          icon="B"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          label="Italic"
          icon="I"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          label="Strikethrough"
          icon="S̶"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          label="Inline Code"
          icon="<>"
        />
      </ButtonGroup>

      {/* Lists */}
      <ButtonGroup>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          label="Bullet List"
          icon="•"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          label="Numbered List"
          icon="1."
        />
      </ButtonGroup>

      {/* Links & Media */}
      <ButtonGroup>
        <ToolButton
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          isActive={editor.isActive("link")}
          label="Link"
          icon="🔗"
        />
        <ToolButton
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          label="Image"
          icon="🖼"
        />
      </ButtonGroup>

      {/* Table & Blocks */}
      <ButtonGroup>
        <ToolButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          label="Table"
          icon="📊"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          label="Code Block"
          icon="</>"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          label="Quote"
          icon=""
        />
      </ButtonGroup>

      {/* Fullscreen */}
      <button
        onClick={() => setIsFullscreen(true)}
        style={{
          marginLeft: "auto",
          padding: "8px 16px",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background = "#4338ca";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = "#4f46e5";
        }}
      >
        ⛶ Fullscreen
      </button>
    </div>
  );

  const editorContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <MenuBar />
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );

  return (
    <>
      {isFullscreen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "1200px",
              height: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
              zIndex: 1002,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              padding: "16px", 
              borderBottom: "1px solid #e5e7eb", 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fafbfc"
            }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#111827" }}>
                Fullscreen Editor
              </h2>
              <button
                onClick={() => setIsFullscreen(false)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = "#ef4444";
                }}
              >
                ✕ Close
              </button>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              {editorContent}
            </div>
          </div>
        </div>
      )}

      {editorContent}
    </>
  );
}
