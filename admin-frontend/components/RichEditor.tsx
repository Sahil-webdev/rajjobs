"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import api from "../lib/api";

interface EditorProps {
  editorData: string;
  setEditorData: (html: string) => void;
  handleOnUpdate: (html: string, field: string) => void;
  uploadFolder?: string;
}

declare global {
  interface Window {
    CKEDITOR?: any;
  }
}

const CKEDITOR_SCRIPT_URL = "https://cdn.ckeditor.com/4.22.1/full/ckeditor.js";
const CKEDITOR_SCRIPT_ID = "rajjobs-ckeditor4-full";

const FULL_TOOLBAR = [
  { name: "document", items: ["Source", "-", "Save", "NewPage", "Preview", "Print", "-", "Templates"] },
  { name: "clipboard", items: ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "-", "Undo", "Redo"] },
  { name: "editing", items: ["Find", "Replace", "-", "SelectAll", "-", "Scayt"] },
  { name: "forms", items: ["Form", "Checkbox", "Radio", "TextField", "Textarea", "Select", "Button", "ImageButton", "HiddenField"] },
  "/",
  { name: "basicstyles", items: ["Bold", "Italic", "Underline", "Strike", "Subscript", "Superscript", "-", "RemoveFormat", "CopyFormatting"] },
  { name: "paragraph", items: ["NumberedList", "BulletedList", "-", "Outdent", "Indent", "-", "Blockquote", "CreateDiv", "-", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock", "-", "BidiLtr", "BidiRtl", "Language"] },
  { name: "links", items: ["Link", "Unlink", "Anchor"] },
  { name: "insert", items: ["Image", "Table", "HorizontalRule", "Smiley", "SpecialChar", "PageBreak", "Iframe"] },
  "/",
  { name: "styles", items: ["Styles", "Format", "Font", "FontSize"] },
  { name: "colors", items: ["TextColor", "BGColor"] },
  { name: "tools", items: ["Maximize", "ShowBlocks"] },
  { name: "about", items: ["About"] },
];

const RichEditor: FC<EditorProps> = ({ editorData, setEditorData, handleOnUpdate, uploadFolder = "editor-images" }) => {
  const editorRef = useRef<any>(null);
  const latestDataRef = useRef(editorData || "");
  const hasInitialisedRef = useRef(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const pdfSelectionBookmarksRef = useRef<any>(null);
  const pdfSelectedTextRef = useRef("");
  const [toolbarHidden, setToolbarHidden] = useState(false);
  const [status, setStatus] = useState("Loading CKEditor Full build...");
  const [error, setError] = useState("");

  const syncEditorData = (editor: any) => {
    const html = editor.getData();
    if (html === latestDataRef.current) return;
    latestDataRef.current = html;
    setEditorData(html);
    handleOnUpdate(html, "description");
  };

  useEffect(() => {
    const STYLE_ID = "rajjobs-ckeditor4-toolbar-style";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        #editorContainer.hide-toolbar .cke_top {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const reportError = (message: string) => {
      console.error(`[RajJobs CKEditor] ${message}`);
      setError(message);
      setStatus("CKEditor could not start.");
    };

    const initialiseEditor = () => {
      const CKEDITOR = window.CKEDITOR;
      if (!CKEDITOR) {
        reportError("CKEDITOR is not defined. Check CDN, CSP, and script loading.");
        return;
      }
      if (hasInitialisedRef.current) return;

      const existingInstance = CKEDITOR.instances.news_content;
      if (existingInstance) {
        try {
          existingInstance.destroy(true);
        } catch (destroyError) {
          reportError(`Duplicate CKEditor instance could not be removed: ${String(destroyError)}`);
          return;
        }
      }

      try {
        const editor = CKEDITOR.replace("news_content", {
          height: 500,
          versionCheck: false,
          toolbarCanCollapse: true,
          toolbar: FULL_TOOLBAR,
        });
        editorRef.current = editor;
        hasInitialisedRef.current = true;

        editor.on("instanceReady", () => {
          const visibleItems = Object.keys(editor.ui.items || {}).sort();
          const loadedPlugins = Object.keys(CKEDITOR.plugins.registered || {}).sort();
          const expectedItems = FULL_TOOLBAR
            .flatMap((group: any) => (typeof group === "string" ? [] : group.items))
            .filter((item: string) => item !== "-");
          const missingItems = expectedItems.filter((item: string) => !editor.ui.items[item]);

          console.log("CKEditor version:", CKEDITOR.version);
          console.log("CKEditor base path:", CKEDITOR.basePath);
          console.log("Loaded plugins:", loadedPlugins);
          console.log("Available UI items:", visibleItems);

          if (missingItems.length) {
            reportError(`Toolbar/plugin conflict: these requested items are unavailable: ${missingItems.join(", ")}. Check CDN, CSP, or duplicate CKEditor scripts.`);
            return;
          }

          if (latestDataRef.current) editor.setData(latestDataRef.current);
          setStatus(`CKEditor ${CKEDITOR.version} Full build loaded — ${visibleItems.length} tools available.`);

          const form = editor.element.$.closest("form") as HTMLFormElement | null;
          formRef.current = form;
          form?.addEventListener("submit", editor.updateElement);

          editor.on("change", () => syncEditorData(editor));
          editor.on("afterPaste", () => syncEditorData(editor));
          editor.on("afterUndo", () => syncEditorData(editor));
          editor.on("afterRedo", () => syncEditorData(editor));
        });
      } catch (initialisationError) {
        reportError(`CKEDITOR.replace failed: ${String(initialisationError)}`);
      }
    };

    // CKEditor Full loads its own `config.js` after `ckeditor.js`. That config
    // file is a required dependency, not a second editor build. Only reject a
    // second *ckeditor.js* build (basic/standard/local/etc.).
    const ckeditorScripts = Array.from(document.scripts).filter((script) => /\/ckeditor\.js(?:\?|$)/i.test(script.src));
    const conflictingScript = ckeditorScripts.find((script) => script.src !== CKEDITOR_SCRIPT_URL);
    if (conflictingScript) {
      reportError(`Conflicting CKEditor script found: ${conflictingScript.src}. Only ${CKEDITOR_SCRIPT_URL} is allowed.`);
      return;
    }

    if (window.CKEDITOR) {
      initialiseEditor();
      return;
    }

    let script = document.getElementById(CKEDITOR_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = CKEDITOR_SCRIPT_ID;
      script.src = CKEDITOR_SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => initialiseEditor();
    const handleScriptError = () => reportError(`Could not load ${CKEDITOR_SCRIPT_URL}. Check network access, CSP, or the CDN URL.`);
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleScriptError, { once: true });

    if (window.CKEDITOR) initialiseEditor();

    return () => {
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleScriptError);
      formRef.current?.removeEventListener("submit", editorRef.current?.updateElement);
      if (editorRef.current && editorRef.current.status !== "destroyed") {
        try {
          editorRef.current.destroy(true);
        } catch (destroyError) {
          console.error("[RajJobs CKEditor] Cleanup failed:", destroyError);
        }
      }
      editorRef.current = null;
      hasInitialisedRef.current = false;
    };
  // The CKEditor instance must only be created once per mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    latestDataRef.current = editorData || "";
    const editor = editorRef.current;
    if (editor && editor.status === "ready" && editor.getData() !== latestDataRef.current) {
      editor.setData(latestDataRef.current);
    }
  }, [editorData]);

  const toggleToolbar = () => setToolbarHidden((previous) => !previous);

  const insertCustomLink = () => {
    const editor = editorRef.current;
    const CKEDITOR = window.CKEDITOR;
    if (!editor || !CKEDITOR) return;

    let url = window.prompt("Link URL डालें:", "https://");
    if (!url?.trim()) return;
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

    const selectedText = editor.getSelection()?.getSelectedText() || "";
    const text = window.prompt("Link text:", selectedText || "यहाँ क्लिक करें");
    if (text === null) return;

    const link = new CKEDITOR.dom.element("a");
    link.setAttribute("href", url);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.setText(text.trim() || url);
    editor.insertElement(link);
    syncEditorData(editor);
  };

  const insertCustomImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("सिर्फ image file चुनें.");
      return;
    }

    const altText = window.prompt("Image alt text:", file.name) || "";
    setStatus("Uploading image to media storage…");
    setError("");
    try {
      const body = new FormData();
      body.append("upload", file);
      body.append("folder", uploadFolder);
      const response = await api.post("/api/admin/file/upload-image", body);
      const source = response.data?.url;
      const editor = editorRef.current;
      const CKEDITOR = window.CKEDITOR;
      if (!editor || !CKEDITOR || typeof source !== "string") return;

      const image = new CKEDITOR.dom.element("img");
      image.setAttribute("src", source);
      image.setAttribute("alt", altText);
      image.setStyle("max-width", "100%");
      image.setStyle("height", "auto");
      editor.insertElement(image);
      editor.insertHtml("<p><br></p>");
      syncEditorData(editor);
      setStatus("Image uploaded to Cloudflare R2.");
    } catch (uploadError: any) {
      const message = uploadError?.response?.data?.error?.message || uploadError?.message || "Image upload failed.";
      setError(message);
      setStatus("Image upload failed.");
    }
  };

  const preparePdfUpload = (event: React.MouseEvent<HTMLLabelElement>) => {
    const editor = editorRef.current;
    if (!editor || editor.status !== "ready") {
      event.preventDefault();
      setError("Editor is not ready yet. Please wait a moment and try again.");
      return;
    }

    editor.focus();
    const selection = editor.getSelection();
    const selectedText = selection?.getSelectedText()?.trim() || "";
    if (!selectedText) {
      event.preventDefault();
      window.alert("पहले editor में उस word या text को select करें जिस पर PDF link लगाना है.");
      return;
    }

    // The file picker temporarily moves focus out of CKEditor. Bookmarks keep
    // the exact selected text available until the R2 upload completes.
    pdfSelectionBookmarksRef.current = selection.createBookmarks2(true);
    pdfSelectedTextRef.current = selectedText;
    setError("");
  };

  const insertPdfLink = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      window.alert("सिर्फ PDF file चुनें.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      window.alert("PDF file 10 MB से छोटी होनी चाहिए.");
      return;
    }

    setStatus("Uploading PDF to media storage…");
    setError("");
    try {
      const body = new FormData();
      body.append("pdf", file);
      const response = await api.post("/api/admin/file/upload-pdf", body);
      const source = response.data?.data?.url;
      const editor = editorRef.current;
      const CKEDITOR = window.CKEDITOR;
      const bookmarks = pdfSelectionBookmarksRef.current;
      const selectedText = pdfSelectedTextRef.current || file.name;

      if (!editor || !CKEDITOR || typeof source !== "string") {
        throw new Error("PDF upload completed but the editor is no longer available.");
      }

      editor.focus();
      if (bookmarks) editor.getSelection().selectBookmarks(bookmarks);

      const link = new CKEDITOR.dom.element("a");
      link.setAttribute("href", source);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.setAttribute("title", `Open PDF: ${file.name}`);
      link.setStyle("color", "#2563eb");
      link.setStyle("font-weight", "600");
      link.setStyle("text-decoration", "underline");
      link.setText(selectedText);
      editor.insertElement(link);

      pdfSelectionBookmarksRef.current = null;
      pdfSelectedTextRef.current = "";
      syncEditorData(editor);
      setStatus("PDF uploaded to Cloudflare R2 and linked to the selected text.");
    } catch (uploadError: any) {
      const message = uploadError?.response?.data?.message || uploadError?.message || "PDF upload failed.";
      setError(message);
      setStatus("PDF upload failed.");
    }
  };

  return (
    <div id="editorContainer" className={toolbarHidden ? "hide-toolbar" : ""}>
      <div style={editorHeaderStyle}>
        <strong style={{ fontSize: 18 }}>Full Story</strong>
        <div style={editorActionsStyle}>
          <button type="button" id="toolbarToggleBtn" onClick={toggleToolbar} style={actionButtonStyle}>
            {toolbarHidden ? "Show Tools" : "Hide Tools"}
          </button>
          <button type="button" id="customLinkBtn" onClick={insertCustomLink} style={actionButtonStyle}>
            Add Link
          </button>
          <label id="customImageBtn" htmlFor="ckCustomImage" style={actionButtonStyle}>
            Insert Image
          </label>
          <input type="file" id="ckCustomImage" accept="image/*" hidden onChange={insertCustomImage} />
          <label id="customPdfBtn" htmlFor="ckCustomPdf" onClick={preparePdfUpload} style={actionButtonStyle}>
            Attach PDF to Selected Text
          </label>
          <input type="file" id="ckCustomPdf" accept="application/pdf,.pdf" hidden onChange={insertPdfLink} />
        </div>
      </div>

      <textarea id="news_content" name="content" required defaultValue="" style={{ width: "100%", minHeight: 500 }} />

      <p style={{ ...statusStyle, ...(error ? errorStyle : {}) }} role={error ? "alert" : "status"}>
        {error || status}
      </p>
    </div>
  );
};

const editorHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 10,
};

const editorActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const actionButtonStyle: React.CSSProperties = {
  cursor: "pointer",
  padding: "9px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#fff",
  fontWeight: 700,
  color: "#111827",
  fontSize: 14,
  lineHeight: 1.25,
};

const statusStyle: React.CSSProperties = {
  marginTop: 10,
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  background: "#f8fafc",
  fontSize: 13,
  whiteSpace: "pre-wrap",
  color: "#334155",
};

const errorStyle: React.CSSProperties = {
  borderColor: "#fecaca",
  background: "#fef2f2",
  color: "#b91c1c",
};

export default RichEditor;
