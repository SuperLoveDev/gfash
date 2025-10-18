import ReactQuill from "react-quill-new";
import React, { useEffect, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";

const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const [editorValue, setEditorValue] = useState(value || "");
  const quillRef = useRef(false);

  // Configuration des modules ReactQuill avec plus d'options
  const modules = {
    toolbar: [
      [{ font: [] }, { size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ color: [] }, { background: [] }],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "color",
    "background",
    "list",
    "indent",
    "align",
    "link",
    "image",
  ];

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true;

      // Style personnalisé pour l'éditeur
      setTimeout(() => {
        const toolbars = document.querySelectorAll(".ql-toolbar");
        toolbars.forEach((toolbar, index) => {
          if (index > 0) {
            toolbar.remove();
          }
        });

        // Styles CSS personnalisés - TOUT EN BLANC
        const style = document.createElement("style");
        style.textContent = `
          .rich-text-editor {
            margin-bottom: 20px; /* Espace APRÈS l'éditeur */
          }
          .rich-text-editor .ql-editor {
            font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #ffffff;
            background: #1a1a1a;
            min-height: 150px;
          }
          .rich-text-editor .ql-editor.ql-blank::before {
            color: #cccccc !important;
            font-style: italic;
          }
          .rich-text-editor .ql-container {
            font-family: inherit;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
            background: #1a1a1a;
            border: 1px solid #ffffff;
            border-top: none;
          }
          .rich-text-editor .ql-toolbar {
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            background: #2d2d2d;
            border: 1px solid #ffffff;
            border-bottom: none;
          }
          .rich-text-editor .ql-toolbar .ql-stroke {
            stroke: #ffffff !important;
          }
          .rich-text-editor .ql-toolbar .ql-fill {
            fill: #ffffff !important;
          }
          .rich-text-editor .ql-toolbar .ql-picker-label {
            color: #ffffff !important;
          }
          .rich-text-editor .ql-toolbar .ql-picker-item {
            color: #ffffff !important;
          }
          .rich-text-editor .ql-toolbar .ql-picker-options {
            background: #2d2d2d !important;
            color: #ffffff !important;
            border: 1px solid #ffffff !important;
          }
          .rich-text-editor .ql-toolbar .ql-picker.ql-expanded .ql-picker-label {
            color: #ffffff !important;
            border-color: #ffffff !important;
          }
          .rich-text-editor .ql-toolbar button:hover,
          .rich-text-editor .ql-toolbar button:focus,
          .rich-text-editor .ql-toolbar .ql-picker-label:hover,
          .rich-text-editor .ql-toolbar .ql-picker-label.ql-active {
            background: #404040 !important;
            color: #ffffff !important;
          }
          .rich-text-editor .ql-toolbar .ql-picker.ql-header .ql-picker-label::before,
          .rich-text-editor .ql-toolbar .ql-picker.ql-font .ql-picker-label::before,
          .rich-text-editor .ql-toolbar .ql-picker.ql-size .ql-picker-label::before {
            color: #ffffff !important;
          }
        `;
        document.head.appendChild(style);
      }, 100);
    }
  }, []);

  useEffect(() => {
    setEditorValue(value || "");
  }, [value]);

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  return (
    <div className="rich-text-editor">
      <ReactQuill
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        theme="snow"
        placeholder="Rédigez une description détaillée de votre produit..."
        // style={{
        //   height: "200px",
        //   overflowY: "auto",
        // }}
      />
    </div>
  );
};

export default RichTextEditor;
