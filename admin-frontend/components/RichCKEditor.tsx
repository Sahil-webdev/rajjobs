"use client";

import React, { FC, useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
// import { CKBox } from "@ckeditor/ckeditor5-ckbox";
import {
  ClassicEditor,
  Autoformat,
  Bold,
  Italic,
  Underline,
  BlockQuote,
  Base64UploadAdapter,
  CloudServices,
  Essentials,
  Heading,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  PictureEditing,
  Indent,
  IndentBlock,
  FontSize,
  Link,
  List,
  Font,
  Mention,
  Paragraph,
  PasteFromOffice,
  Table,
  TableColumnResize,
  TableToolbar,
  CKBox,
  TextTransformation,
  SourceEditing,
  BalloonToolbar,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import "ckeditor5-premium-features/ckeditor5-premium-features.css";

interface CkEditorProps {
  editorData: string;
  setEditorData: (data: string) => void;
  handleOnUpdate: (editor: string, field: string) => void;
}
const CkEditor: FC<CkEditorProps> = ({
  setEditorData,
  editorData,
  handleOnUpdate,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    console.log("what is editorData: ", editorData);
  }, [editorData]);

  return (
    <div
      style={
        isFullscreen
          ? {
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#fff",
            padding: "16px",
            overflow: "auto",
          }
          : {
            width: "100%",
          }
      }
    >
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
        <button
          type="button"
          onClick={() => setIsFullscreen((prev) => !prev)}
          style={{
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            color: "#111827",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>
      <CKEditor
        editor={ClassicEditor}
        config={{
          licenseKey: process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY || "GPL",
          plugins: [
            Autoformat,
            BlockQuote,
            Bold,
            CloudServices,
            CKBox,
            Essentials,
            BalloonToolbar,
            Heading,
            Image,
            ImageCaption,
            ImageResize,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            Base64UploadAdapter,
            FontSize,
            Indent,
            IndentBlock,
            Italic,
            Link,
            Font,
            List,
            Mention,
            Paragraph,
            PasteFromOffice,
            PictureEditing,
            Table,
            TableColumnResize,
            TableToolbar,
            TextTransformation,
            Underline,
            SourceEditing,
          ],
          cloudServices: {
            tokenUrl: process.env.NEXT_PUBLIC_CKEDITOR_CLOUD_TOKEN_URL,
            webSocketUrl: process.env.NEXT_PUBLIC_CKEDITOR_WEB_SOCKET_URL,
            webSocketUploads: true,
          },
          ckbox: {
            tokenUrl: process.env.NEXT_PUBLIC_CKEDITOR_CLOUD_TOKEN_URL,
          },

          toolbar: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "link",
            "uploadImage",
            "ckbox",
            "insertTable",
            "blockQuote",
            "|",
            "fontSize",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "outdent",
            "indent",
            "sourceEditing"
          ],

          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
                class: "ck-heading_paragraph",
              },
              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
                class: "ck-heading_heading1",
              },
              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
                class: "ck-heading_heading2",
              },
              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
                class: "ck-heading_heading3",
              },
              {
                model: "heading4",
                view: "h4",
                title: "Heading 4",
                class: "ck-heading_heading4",
              },
              {
                model: "heading5",
                view: "h5",
                title: "Heading 5",
                class: "ck-heading_heading5",
              },
              {
                model: "heading6",
                view: "h6",
                title: "Heading 6",
                class: "ck-heading_heading6",
              },
            ],
          },

          image: {
            resizeOptions: [
              {
                name: "resizeImage:original",
                label: "Default image width",
                value: null,
              },
              {
                name: "resizeImage:50",
                label: "50% page width",
                value: "50",
              },
              {
                name: "resizeImage:75",
                label: "75% page width",
                value: "75",
              },
            ],
            toolbar: [
              "imageTextAlternative",
              "|",
              "imageStyle:alignBlockLeft",
              "imageStyle:block",
              "imageStyle:alignBlockRight",
              "|",
              "resizeImage",
            ],
            styles: [
              "full",
              "side",
              "alignLeft",
              "alignRight",
              "alignCenter",
              "alignBlockLeft",
              "alignBlockRight",
            ],
          },

          fontColor: {
            colors: [
              {
                color: "hsl(0, 0%, 0%)",
                label: "Black",
              },
              {
                color: "hsl(0, 0%, 30%)",
                label: "Dim grey",
              },
              {
                color: "hsl(0, 0%, 60%)",
                label: "Grey",
              },
              {
                color: "hsl(0, 0%, 90%)",
                label: "Light grey",
              },
              {
                color: "hsl(0, 0%, 100%)",
                label: "White",
                hasBorder: true,
              },
              {
                color: "hsl(0, 0%, 100%)",
                label: "White",
                hasBorder: true,
              },
              {
                color: "hsl(0, 75%, 60%)",
                label: "Red",
              },
              {
                color: "hsl(30, 75%, 60%)",
                label: "Orange",
              },
              {
                color: "hsl(60, 75%, 60%)",
                label: "Yellow",
              },
              {
                color: "hsl(90, 75%, 60%)",
                label: "Light green",
              },
              {
                color: "hsl(120, 75%, 60%)",
                label: "Green",
              },
            ],
          },
          fontSize: {
            options: [10, 12, 14, 'default', 18, 20, 22],
            supportAllValues: true
          },
          fontBackgroundColor: {
            colors: [
              {
                color: "hsl(0, 75%, 60%)",
                label: "Red",
              },
              {
                color: "hsl(30, 75%, 60%)",
                label: "Orange",
              },
              {
                color: "hsl(60, 75%, 60%)",
                label: "Yellow",
              },
              {
                color: "hsl(90, 75%, 60%)",
                label: "Light green",
              },
              {
                color: "hsl(120, 75%, 60%)",
                label: "Green",
              },
              {
                color: "hsl(0, 0%, 0%)",
                label: "Black",
              },
              {
                color: "hsl(0, 0%, 30%)",
                label: "Dim grey",
              },
              {
                color: "hsl(0, 0%, 60%)",
                label: "Grey",
              },
              {
                color: "hsl(0, 0%, 90%)",
                label: "Light grey",
              },
            ],
          },
          menuBar: {
            isVisible: true
          },
          balloonToolbar: ['bold', 'italic', '|', 'link', 'insertImage', '|', 'bulletedList', 'numberedList'],
          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: "https://",
            decorators: {
              toggleDownloadable: {
                mode: 'manual',
                label: 'Downloadable',
                attributes: {
                  download: 'file'
                }
              }
            }
          },
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells", "tableProperties", "tableCellProperties"],
          },
          initialData: editorData,
        }}
        onChange={(_event, editor) => {
          const data = editor.getData();
          setEditorData(data);
          handleOnUpdate(data, "description");
        }}
        onFocus={() => console.log("Editor focused")}
        onBlur={() => console.log("Editor blurred")}
      />
    </div>
  );
};

export default CkEditor;