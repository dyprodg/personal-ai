"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  value: string;
}

export default function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className="relative group my-4 code-block-wrapper"
      suppressHydrationWarning
    >
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={copyToClipboard}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="syntax-highlighter-wrapper" suppressHydrationWarning>
        <SyntaxHighlighter
          language={language || "text"}
          style={coldarkDark}
          customStyle={{
            borderRadius: "0.375rem",
            padding: "1rem",
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
          }}
          PreTag="div"
          wrapLongLines={true}
          codeTagProps={{ suppressHydrationWarning: true }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
