"use client";

import Editor from "@monaco-editor/react";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  height: string;
}

export function MonacoEditor({ value, onChange, language }: MonacoEditorProps) {
  return (
    <Editor
      height={"20vh"}
      value={value}
      language={language}
      onChange={onChange}
      defaultLanguage="json"
    />
  );
}
